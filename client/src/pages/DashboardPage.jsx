import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import CountdownTimer from '../components/launches/CountdownTimer';
import {
  LayoutDashboard,
  Bookmark,
  Heart,
  Rocket,
  User,
  Trash2,
  ExternalLink,
  Edit3,
  Calendar,
  Sparkles,
  MapPin
} from 'lucide-react';

const DashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await userService.getDashboard();
      setDashboardData(data);
      if (data?.user) {
        setNameInput(data.user.name || '');
        setBioInput(data.user.bio || '');
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      notifyError('Failed to load your astronaut dashboard');
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Remove Watchlist item
  const handleRemoveWatchlist = async (id, name) => {
    try {
      await userService.removeFromWatchlist(id);
      notifySuccess(`Removed "${name}" from Watchlist`);
      fetchDashboard();
    } catch (error) {
      notifyError('Failed to remove launch');
    }
  };

  // Remove Favorite item
  const handleRemoveFavorite = async (id, title) => {
    try {
      await userService.removeFavorite(id);
      notifySuccess(`Removed "${title}" from Favorites`);
      fetchDashboard();
    } catch (error) {
      notifyError('Failed to remove favorite item');
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateProfile({ name: nameInput, bio: bioInput });
    setIsUpdating(false);
    if (res.success) {
      setIsEditModalOpen(false);
      fetchDashboard();
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Loader message="Synthesizing astronaut telemetry dashboard..." />
      </div>
    );
  }

  const { metrics, nextLaunch, watchlistItems, recentFavorites } = dashboardData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Profile Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-glow-cyan"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <Badge variant="go">Flight Ready</Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              <p className="text-xs text-slate-300 max-w-xl pt-1 leading-relaxed">
                {user?.bio || 'Space enthusiast exploring the cosmos with CosmicHorizon.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Metric Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              Tracked Launches
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">
            {metrics?.totalWatchlist || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active mission watchlists</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Saved Bookmarks
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">
            {metrics?.totalFavorites || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">APOD & Mars photos saved</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Cadet Status
            </span>
          </div>
          <div className="text-xl font-black text-amber-400">Cosmic Explorer</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Next Upcoming Tracked Launch Hero */}
      {nextLaunch && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-space-card to-cyan-950/20 shadow-glow-cyan">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Next Tracked Countdown
                </span>
              </div>
              <h3 className="text-xl font-black text-white">{nextLaunch.launchName}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Rocket className="w-3.5 h-3.5 text-indigo-400" />
                  {nextLaunch.rocket} ({nextLaunch.agency})
                </span>
                {nextLaunch.padLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {nextLaunch.padLocation}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <CountdownTimer targetDate={nextLaunch.launchDate} />
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">My Mission Watchlist</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {watchlistItems?.length || 0} Missions
          </span>
        </div>

        {!watchlistItems || watchlistItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No missions in your watchlist yet. Visit the{' '}
            <a href="/launches" className="text-cyan-400 font-bold hover:underline">
              Launches Page
            </a>{' '}
            to track upcoming rocket launches.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Mission Name</th>
                  <th className="pb-3 font-semibold">Agency / Rocket</th>
                  <th className="pb-3 font-semibold">Launch Date</th>
                  <th className="pb-3 font-semibold">Countdown</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {watchlistItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-bold text-slate-100">{item.launchName}</td>
                    <td className="py-3 text-slate-300">
                      {item.agency} • {item.rocket}
                    </td>
                    <td className="py-3 text-slate-300">
                      {new Date(item.launchDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <CountdownTimer targetDate={item.launchDate} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemoveWatchlist(item._id, item.launchName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saved Favorites Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Saved Celestial Bookmarks</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {recentFavorites?.length || 0} Items
          </span>
        </div>

        {!recentFavorites || recentFavorites.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No saved astronomy bookmarks yet. Explore the{' '}
            <a href="/nasa" className="text-cyan-400 font-bold hover:underline">
              NASA Explorer
            </a>{' '}
            to save APOD photos and Mars imagery.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentFavorites.map((fav) => (
              <div
                key={fav._id}
                className="glass-panel rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between group"
              >
                {fav.imageUrl && (
                  <div className="h-36 w-full overflow-hidden bg-black">
                    <img
                      src={fav.imageUrl}
                      alt={fav.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      <span>{fav.itemType}</span>
                      <span>{new Date(fav.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{fav.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {fav.description}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleRemoveFavorite(fav._id, fav.title)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Astronaut Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Call Sign / Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Mission Bio
            </label>
            <textarea
              rows={3}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Your astronomy research interests..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition"
            >
              {isUpdating ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
