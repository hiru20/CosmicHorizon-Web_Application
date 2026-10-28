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
  Edit3,
  Calendar,
  Sparkles,
  MapPin,
  Plus,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  AlertTriangle,
  FileText,
  Flag,
  Save,
} from 'lucide-react';

// Priority badge colours
const priorityColors = {
  high: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const DashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----- Edit Profile modal -----
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // ----- Add Custom Space Note (explicit CREATE form) -----
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('apod');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteErrors, setNoteErrors] = useState({});
  const [isSavingNote, setIsSavingNote] = useState(false);

  // ----- Edit Favorite Notes modal -----
  const [editFavItem, setEditFavItem] = useState(null);
  const [editFavNotes, setEditFavNotes] = useState('');
  const [isSavingFav, setIsSavingFav] = useState(false);

  // ----- Edit Watchlist item modal -----
  const [editWatchItem, setEditWatchItem] = useState(null);
  const [editWatchPriority, setEditWatchPriority] = useState('medium');
  const [editWatchNotes, setEditWatchNotes] = useState('');
  const [isSavingWatch, setIsSavingWatch] = useState(false);

  // ----- Delete confirmation modal -----
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'favorite'|'watchlist', id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  // ----- Sort favorites -----
  const [favSort, setFavSort] = useState('newest'); // 'newest' | 'oldest' | 'az'

  // ============================================================
  //  DATA FETCHING
  // ============================================================
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

  // ============================================================
  //  PROFILE UPDATE
  // ============================================================
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setIsUpdating(true);
    const res = await updateProfile({ name: nameInput.trim(), bio: bioInput.trim() });
    setIsUpdating(false);
    if (res.success) {
      setIsEditModalOpen(false);
      fetchDashboard();
    }
  };

  // ============================================================
  //  ADD CUSTOM SPACE NOTE (CREATE)
  // ============================================================
  const validateNote = () => {
    const errs = {};
    if (!noteTitle.trim()) errs.title = 'Title is required';
    else if (noteTitle.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    if (!noteDescription.trim()) errs.description = 'Description is required';
    else if (noteDescription.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    return errs;
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    const errs = validateNote();
    if (Object.keys(errs).length > 0) {
      setNoteErrors(errs);
      return;
    }
    setIsSavingNote(true);
    try {
      await userService.addFavorite({
        itemType: noteCategory,
        itemId: `note-${Date.now()}`,
        title: noteTitle.trim(),
        description: noteDescription.trim(),
        imageUrl: '',
        notes: '',
      });
      notifySuccess(`Space note "${noteTitle.trim()}" saved to favorites!`);
      setNoteTitle('');
      setNoteCategory('apod');
      setNoteDescription('');
      setNoteErrors({});
      setIsAddNoteOpen(false);
      fetchDashboard();
    } catch (err) {
      notifyError(err?.response?.data?.message || 'Failed to save space note');
    } finally {
      setIsSavingNote(false);
    }
  };

  // ============================================================
  //  EDIT FAVORITE NOTES (UPDATE)
  // ============================================================
  const openEditFav = (fav) => {
    setEditFavItem(fav);
    setEditFavNotes(fav.notes || '');
  };

  const handleUpdateFav = async (e) => {
    e.preventDefault();
    setIsSavingFav(true);
    try {
      await userService.updateFavorite(editFavItem._id, editFavNotes);
      notifySuccess('Notes updated successfully');
      setEditFavItem(null);
      fetchDashboard();
    } catch (err) {
      notifyError('Failed to update notes');
    } finally {
      setIsSavingFav(false);
    }
  };

  // ============================================================
  //  EDIT WATCHLIST ITEM (UPDATE)
  // ============================================================
  const openEditWatch = (item) => {
    setEditWatchItem(item);
    setEditWatchPriority(item.priority || 'medium');
    setEditWatchNotes(item.notes || '');
  };

  const handleUpdateWatch = async (e) => {
    e.preventDefault();
    setIsSavingWatch(true);
    try {
      await userService.updateWatchlistItem(editWatchItem._id, {
        priority: editWatchPriority,
        notes: editWatchNotes,
      });
      notifySuccess('Mission watchlist item updated');
      setEditWatchItem(null);
      fetchDashboard();
    } catch (err) {
      notifyError('Failed to update watchlist item');
    } finally {
      setIsSavingWatch(false);
    }
  };

  // ============================================================
  //  DELETE WITH CONFIRMATION
  // ============================================================
  const requestDelete = (type, id, name) => {
    setDeleteTarget({ type, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'favorite') {
        await userService.removeFavorite(deleteTarget.id);
        notifySuccess(`Removed "${deleteTarget.name}" from Favorites`);
      } else {
        await userService.removeFromWatchlist(deleteTarget.id);
        notifySuccess(`Removed "${deleteTarget.name}" from Watchlist`);
      }
      setDeleteTarget(null);
      fetchDashboard();
    } catch (err) {
      notifyError('Failed to remove item');
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================
  //  SORTED FAVORITES
  // ============================================================
  const getSortedFavorites = () => {
    if (!dashboardData?.recentFavorites) return [];
    const arr = [...dashboardData.recentFavorites];
    if (favSort === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (favSort === 'oldest') return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (favSort === 'az') return arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  };

  // ============================================================
  //  RENDER
  // ============================================================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Loader message="Synthesizing astronaut telemetry dashboard..." />
      </div>
    );
  }

  const { metrics, nextLaunch, watchlistItems } = dashboardData || {};
  const sortedFavorites = getSortedFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Profile Header ── */}
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Widgets ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center text-xs text-slate-400 mb-1 gap-1.5">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            Tracked Launches
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">{metrics?.totalWatchlist || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active mission watchlists</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center text-xs text-slate-400 mb-1 gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" />
            Saved Bookmarks
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">{metrics?.totalFavorites || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">APOD &amp; Mars photos saved</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 col-span-2 md:col-span-1">
          <div className="flex items-center text-xs text-slate-400 mb-1 gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Cadet Status
          </div>
          <div className="text-xl font-black text-amber-400">Cosmic Explorer</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* ── Add Custom Space Note (explicit CREATE) ── */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Add Custom Space Note</h2>
          </div>
          <button
            onClick={() => setIsAddNoteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Note
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Manually log your own astronomy observations, research notes, or space discoveries directly into your favorites collection.
        </p>
      </div>

      {/* ── Next Upcoming Launch Hero ── */}
      {nextLaunch && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-space-card to-cyan-950/20 shadow-glow-cyan">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Next Tracked Countdown</span>
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
            <CountdownTimer targetDate={nextLaunch.launchDate} />
          </div>
        </div>
      )}

      {/* ── Watchlist Section ── */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">My Mission Watchlist</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">{watchlistItems?.length || 0} Missions</span>
        </div>

        {!watchlistItems || watchlistItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No missions in your watchlist yet. Visit the{' '}
            <a href="/launches" className="text-cyan-400 font-bold hover:underline">Launches Page</a>{' '}
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
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">Countdown</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {watchlistItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-bold text-slate-100">
                      <div>{item.launchName}</div>
                      {item.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">📝 {item.notes}</div>
                      )}
                    </td>
                    <td className="py-3 text-slate-300">{item.agency} • {item.rocket}</td>
                    <td className="py-3 text-slate-300">{new Date(item.launchDate).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityColors[item.priority || 'medium']}`}>
                        {(item.priority || 'medium').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <CountdownTimer targetDate={item.launchDate} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditWatch(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                          title="Edit Priority / Notes"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestDelete('watchlist', item._id, item.launchName)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Saved Favorites Section ── */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Saved Celestial Bookmarks</h2>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 mr-1">Sort:</span>
            {[
              { key: 'newest', label: 'Newest' },
              { key: 'oldest', label: 'Oldest' },
              { key: 'az', label: 'A–Z' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFavSort(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                  favSort === key
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {sortedFavorites.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No saved astronomy bookmarks yet. Explore the{' '}
            <a href="/nasa" className="text-cyan-400 font-bold hover:underline">NASA Explorer</a>{' '}
            to save APOD photos and Mars imagery, or add a custom space note above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedFavorites.map((fav) => (
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
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{fav.description}</p>
                    {fav.notes && (
                      <p className="text-[11px] text-cyan-400/80 line-clamp-2 mt-1.5 italic">📝 {fav.notes}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => openEditFav(fav)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition"
                      title="Edit notes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Notes</span>
                    </button>
                    <button
                      onClick={() => requestDelete('favorite', fav._id, fav.title)}
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

      {/* ══════════════════════════════════════════════════
           MODALS
         ══════════════════════════════════════════════════ */}

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Astronaut Profile" maxWidth="max-w-md">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Call Sign / Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Mission Bio</label>
            <textarea
              rows={3}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Your astronomy research interests..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={isUpdating}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition">
              {isUpdating ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Custom Space Note Modal */}
      <Modal isOpen={isAddNoteOpen} onClose={() => { setIsAddNoteOpen(false); setNoteErrors({}); }} title="Add Custom Space Note" maxWidth="max-w-lg">
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Note Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => { setNoteTitle(e.target.value); setNoteErrors((p) => ({ ...p, title: '' })); }}
              placeholder="e.g., M87 Black Hole Observation"
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border text-sm text-slate-100 focus:outline-none transition ${
                noteErrors.title ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
              }`}
            />
            {noteErrors.title && <p className="text-[11px] text-rose-400 mt-1">{noteErrors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
            <select
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="apod">APOD – Astronomy Picture</option>
              <option value="mars">Mars – Rover Observation</option>
              <option value="launch">Launch – Mission Note</option>
              <option value="satellite">Satellite – Tracking Note</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={noteDescription}
              onChange={(e) => { setNoteDescription(e.target.value); setNoteErrors((p) => ({ ...p, description: '' })); }}
              placeholder="Describe your astronomy observation or research note in detail..."
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border text-sm text-slate-100 focus:outline-none transition ${
                noteErrors.description ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
              }`}
            />
            {noteErrors.description && <p className="text-[11px] text-rose-400 mt-1">{noteErrors.description}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setIsAddNoteOpen(false); setNoteErrors({}); }}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={isSavingNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition">
              <Save className="w-3.5 h-3.5" />
              {isSavingNote ? 'Saving...' : 'Save to Favorites'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Favorite Notes Modal */}
      <Modal isOpen={!!editFavItem} onClose={() => setEditFavItem(null)} title="Edit Favorite Notes" maxWidth="max-w-md">
        {editFavItem && (
          <form onSubmit={handleUpdateFav} className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-3">
                Editing notes for: <span className="text-slate-200 font-bold">{editFavItem.title}</span>
              </p>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Personal Notes</label>
              <textarea
                rows={4}
                value={editFavNotes}
                onChange={(e) => setEditFavNotes(e.target.value)}
                maxLength={500}
                placeholder="Add your personal notes, observations, or thoughts about this item..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1 text-right">{editFavNotes.length}/500</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditFavItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white">
                Cancel
              </button>
              <button type="submit" disabled={isSavingFav}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition">
                {isSavingFav ? 'Saving...' : 'Update Notes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Watchlist Item Modal */}
      <Modal isOpen={!!editWatchItem} onClose={() => setEditWatchItem(null)} title="Edit Mission Priority" maxWidth="max-w-md">
        {editWatchItem && (
          <form onSubmit={handleUpdateWatch} className="space-y-4">
            <p className="text-xs text-slate-400">
              Editing: <span className="text-slate-200 font-bold">{editWatchItem.launchName}</span>
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Mission Priority</label>
              <div className="flex gap-2">
                {['high', 'medium', 'low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditWatchPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition capitalize ${
                      editWatchPriority === p
                        ? priorityColors[p] + ' shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Flag className="w-3 h-3 inline mr-1" />{p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mission Notes</label>
              <textarea
                rows={3}
                value={editWatchNotes}
                onChange={(e) => setEditWatchNotes(e.target.value)}
                maxLength={500}
                placeholder="Add notes about this launch, e.g., expected payload, viewing location..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1 text-right">{editWatchNotes.length}/500</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditWatchItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white">
                Cancel
              </button>
              <button type="submit" disabled={isSavingWatch}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition">
                {isSavingWatch ? 'Saving...' : 'Update Mission'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Removal" maxWidth="max-w-sm">
        {deleteTarget && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200">
                Are you sure you want to remove{' '}
                <span className="font-bold text-white">"{deleteTarget.name}"</span>{' '}
                from your {deleteTarget.type === 'favorite' ? 'favorites' : 'watchlist'}?
              </p>
            </div>
            <p className="text-xs text-slate-400">This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition"
              >
                {isDeleting ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default DashboardPage;
