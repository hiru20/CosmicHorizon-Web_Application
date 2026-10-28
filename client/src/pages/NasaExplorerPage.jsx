import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ApodViewer from '../components/nasa/ApodViewer';
import MarsGallery from '../components/nasa/MarsGallery';
import NeoRadar from '../components/nasa/NeoRadar';
import SectionHeader from '../components/common/SectionHeader';

const TABS = [
  { id: 'apod', code: '02.1', label: 'Astronomy Picture of the Day', short: 'APOD' },
  { id: 'mars', code: '02.2', label: 'Mars Surface Rovers', short: 'Mars' },
  { id: 'neo', code: '02.3', label: 'Asteroid Radar (NEO)', short: 'Asteroids' },
];

const TAB_IDS = TABS.map((t) => t.id);

// Deep-link support: #mars / #neo open their tab; no hash means APOD
const tabFromHash = (hash) => {
  const id = (hash || '').replace('#', '');
  return TAB_IDS.includes(id) ? id : 'apod';
};

const HEADINGS = {
  apod: { title: 'Deep-field archive', description: 'One photograph a day since June 1995, each annotated by a professional astronomer. Pick any date in the record.' },
  mars: { title: 'Surface frames', description: 'Raw engineering and science frames downlinked by Perseverance and Curiosity, indexed by sol and camera.' },
  neo: { title: 'Close approaches', description: 'Near-Earth objects passing this week, measured against the Moon. Hazard class follows NASA NeoWs.' },
};

const NasaExplorerPage = () => {
  const { isAuthenticated } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => tabFromHash(location.hash));
  const [favoritedItemIds, setFavoritedItemIds] = useState(new Set());
  const tabRefs = useRef({});

  // Keep the active tab in sync with the URL hash (navbar "04 Asteroids" links to #neo)
  useEffect(() => {
    setActiveTab(tabFromHash(location.hash));
  }, [location.hash]);

  const selectTab = (id) => {
    setActiveTab(id);
    navigate({ hash: id === 'apod' ? '' : id }, { replace: true });
  };

  const handleTabKeyDown = (e) => {
    const i = TAB_IDS.indexOf(activeTab);
    let next = null;
    if (e.key === 'ArrowRight') next = TAB_IDS[(i + 1) % TAB_IDS.length];
    if (e.key === 'ArrowLeft') next = TAB_IDS[(i - 1 + TAB_IDS.length) % TAB_IDS.length];
    if (e.key === 'Home') next = TAB_IDS[0];
    if (e.key === 'End') next = TAB_IDS[TAB_IDS.length - 1];
    if (next) {
      e.preventDefault();
      selectTab(next);
      tabRefs.current[next]?.focus();
    }
  };

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

  const heading = HEADINGS[activeTab];

  return (
    <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 space-y-10">
      <SectionHeader
        index={activeTab === 'neo' ? '04' : '02'}
        eyebrow={activeTab === 'neo' ? 'NASA NeoWs' : 'NASA Open APIs'}
        title={heading.title}
        description={heading.description}
      />

      {/* Numbered tablist */}
      <div
        role="tablist"
        aria-label="NASA data sets"
        onKeyDown={handleTabKeyDown}
        className="flex border-b border-line overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              id={`tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              className={`group relative flex-shrink-0 flex items-baseline gap-3 h-12 pr-8 font-mono text-[0.6875rem] uppercase tracking-label transition-colors ${
                isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              <span className={isActive ? 'text-signal' : 'text-fg-faint'}>{tab.code}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
              <span
                className={`absolute left-0 right-8 -bottom-px h-px origin-left transition-transform duration-300 ease-out ${
                  isActive ? 'bg-signal scale-x-100' : 'bg-fg-muted scale-x-0 group-hover:scale-x-100'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
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
    </div>
  );
};

export default NasaExplorerPage;
