import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ApodViewer from '../components/nasa/ApodViewer';
import MarsGallery from '../components/nasa/MarsGallery';
import NeoRadar from '../components/nasa/NeoRadar';
import { Telescope, Sparkles, Camera, Activity } from 'lucide-react';

const TABS = [
  { id: 'apod', label: 'Astronomy Picture of the Day', icon: Sparkles },
  { id: 'mars', label: 'Mars Surface Rovers', icon: Camera },
  { id: 'neo', label: 'Asteroid Radar (NEO)', icon: Activity },
];

const NasaExplorerPage = () => {
  const { isAuthenticated } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  const [activeTab, setActiveTab] = useState('apod');
  const [favoritedItemIds, setFavoritedItemIds] = useState(new Set());

  // Fetch user's existing favorites to highlight saved items
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoritedItemIds(new Set());
      return;
    }
    try {
      const items = await userService.getFavorites();
      const ids = new Set((items || []).map((i) => String(i.itemId)));
      setFavoritedItemIds(ids);
    } catch (e) {
      console.warn('Could not load favorites:', e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (item) => {
    if (!isAuthenticated) {
      notifyInfo('Please sign in or register to save astronomy content to your favorites!');
      return;
    }

    const idStr = String(item.itemId);
    const isFav = favoritedItemIds.has(idStr);

    try {
      if (isFav) {
        await userService.removeFavorite(idStr);
        setFavoritedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(idStr);
          return next;
        });
        notifySuccess(`Removed "${item.title}" from your favorites`);
      } else {
        await userService.addFavorite(item);
        setFavoritedItemIds((prev) => new Set([...prev, idStr]));
        notifySuccess(`Saved "${item.title}" to your favorites!`);
      }
    } catch (error) {
      notifyError(error.message || 'Failed to update favorites');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Telescope className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              NASA Deep Space Explorer
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Explore Astronomy Picture of the Day archives, Martian rover imagery, and close-approach asteroids
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'apod' && (
        <ApodViewer
          isFavorited={favoritedItemIds.has(new Date().toISOString().split('T')[0])}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {activeTab === 'mars' && (
        <MarsGallery
          isPhotoFavorited={(id) => favoritedItemIds.has(String(id))}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {activeTab === 'neo' && <NeoRadar />}
    </div>
  );
};

export default NasaExplorerPage;
