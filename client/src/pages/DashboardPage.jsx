import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import CountdownTimer from '../components/launches/CountdownTimer';
import {
  Bookmark,
  Heart,
  Rocket,
  Trash2,
  Edit3,
  Sparkles,
  MapPin,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  FileText,
  Flag,
  Save,
  Search,
  Eye,
  BellRing,
  BookOpen,
  Calendar,
} from 'lucide-react';

// Priority badge colours
const priorityColors = {
  high: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const reminderLabels = {
  none: 'No Reminder',
  '15m': '15m before',
  '1h': '1h before',
  '24h': '1d before',
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

  // ----- Add Space Journal Entry (CREATE) -----
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('apod');
  const [noteImageUrl, setNoteImageUrl] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [notePersonalNotes, setNotePersonalNotes] = useState('');
  const [noteErrors, setNoteErrors] = useState({});
  const [isSavingNote, setIsSavingNote] = useState(false);

  // ----- View Journal Entry Details modal (READ single item) -----
  const [viewFavItem, setViewFavItem] = useState(null);

  // ----- Edit Space Journal Entry modal (UPDATE) -----
  const [editFavItem, setEditFavItem] = useState(null);
  const [editFavTitle, setEditFavTitle] = useState('');
  const [editFavCategory, setEditFavCategory] = useState('apod');
  const [editFavDescription, setEditFavDescription] = useState('');
  const [editFavImageUrl, setEditFavImageUrl] = useState('');
  const [editFavNotes, setEditFavNotes] = useState('');
  const [isSavingFav, setIsSavingFav] = useState(false);

  // ----- Edit Watchlist item modal (UPDATE) -----
  const [editWatchItem, setEditWatchItem] = useState(null);
  const [editWatchPriority, setEditWatchPriority] = useState('medium');
  const [editWatchReminder, setEditWatchReminder] = useState('none');
  const [editWatchNotes, setEditWatchNotes] = useState('');
  const [isSavingWatch, setIsSavingWatch] = useState(false);

  // ----- Delete confirmation modal (DELETE) -----
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'favorite'|'watchlist', id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  // ----- Space Journal Search, Category Filter & Sort -----
  const [journalSearch, setJournalSearch] = useState('');
  const [journalCategory, setJournalCategory] = useState('all');
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
  //  ADD SPACE JOURNAL ENTRY (CREATE)
  // ============================================================
  const validateNote = () => {
    const errs = {};
    if (!noteTitle.trim()) errs.title = 'Entry title is required';
    else if (noteTitle.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    if (!noteDescription.trim()) errs.description = 'Observation description is required';
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
        itemId: `journal-${Date.now()}`,
        title: noteTitle.trim(),
        description: noteDescription.trim(),
        imageUrl: noteImageUrl.trim(),
        notes: notePersonalNotes.trim(),
      });
      notifySuccess(`Journal entry "${noteTitle.trim()}" added to My Space Journal!`);
      setNoteTitle('');
      setNoteCategory('apod');
      setNoteImageUrl('');
      setNoteDescription('');
      setNotePersonalNotes('');
      setNoteErrors({});
      setIsAddNoteOpen(false);
      fetchDashboard();
    } catch (err) {
      notifyError(err?.message || 'Failed to save space journal entry');
    } finally {
      setIsSavingNote(false);
    }
  };

  // ============================================================
  //  EDIT SPACE JOURNAL ENTRY (UPDATE)
  // ============================================================
  const openEditFav = (fav) => {
    setEditFavItem(fav);
    setEditFavTitle(fav.title || '');
    setEditFavCategory(fav.itemType || 'apod');
    setEditFavDescription(fav.description || '');
    setEditFavImageUrl(fav.imageUrl || '');
    setEditFavNotes(fav.notes || '');
  };

  const handleUpdateFav = async (e) => {
    e.preventDefault();
    if (!editFavTitle.trim()) {
      notifyError('Title cannot be empty');
      return;
    }
    setIsSavingFav(true);
    try {
      await userService.updateFavorite(editFavItem._id, {
        title: editFavTitle.trim(),
        itemType: editFavCategory,
        description: editFavDescription.trim(),
        imageUrl: editFavImageUrl.trim(),
        notes: editFavNotes.trim(),
      });
      notifySuccess('Space journal entry updated successfully');
      setEditFavItem(null);
      fetchDashboard();
    } catch (err) {
      notifyError(err?.message || 'Failed to update journal entry');
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
    setEditWatchReminder(item.reminderTime || 'none');
    setEditWatchNotes(item.notes || '');
  };

  const handleUpdateWatch = async (e) => {
    e.preventDefault();
    setIsSavingWatch(true);
    try {
      await userService.updateWatchlistItem(editWatchItem._id, {
        priority: editWatchPriority,
        reminderTime: editWatchReminder,
        notes: editWatchNotes,
      });

      // Also sync localStorage reminder map
      try {
        const stored = JSON.parse(localStorage.getItem('cosmic_launch_reminders') || '{}');
        if (editWatchReminder === 'none') {
          delete stored[String(editWatchItem.launchId)];
        } else {
          stored[String(editWatchItem.launchId)] = editWatchReminder;
        }
        localStorage.setItem('cosmic_launch_reminders', JSON.stringify(stored));
      } catch {
        // ignore storage errors
      }

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
        notifySuccess(`Deleted "${deleteTarget.name}" from My Space Journal`);
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
  //  FILTERED & SORTED SPACE JOURNAL ENTRIES
  // ============================================================
  const getFilteredJournalEntries = () => {
    if (!dashboardData?.recentFavorites) return [];
    let arr = [...dashboardData.recentFavorites];

    if (journalCategory !== 'all') {
      arr = arr.filter((item) => item.itemType === journalCategory);
    }

    if (journalSearch.trim()) {
      const q = journalSearch.trim().toLowerCase();
      arr = arr.filter(
        (item) =>
          (item.title || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q) ||
          (item.itemType || '').toLowerCase().includes(q)
      );
    }

    if (favSort === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (favSort === 'oldest') return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (favSort === 'az') return arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
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
  const journalEntries = getFilteredJournalEntries();

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
            <BookOpen className="w-4 h-4 text-rose-400" />
            Space Journal Entries
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">{metrics?.totalFavorites || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Saved discoveries &amp; observations</div>
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
            <h2 className="text-lg font-bold text-white">My Mission Watchlist &amp; Reminders</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">{watchlistItems?.length || 0} Missions</span>
        </div>

        {!watchlistItems || watchlistItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No missions in your watchlist yet. Visit the{' '}
            <a href="/launches" className="text-cyan-400 font-bold hover:underline">Launches Page</a>{' '}
            to track upcoming rocket launches and set reminders.
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
                  <th className="pb-3 font-semibold">Reminder</th>
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
                      {item.reminderTime && item.reminderTime !== 'none' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <BellRing className="w-3 h-3" />
                          {reminderLabels[item.reminderTime] || item.reminderTime}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Off</span>
                      )}
                    </td>
                    <td className="py-3">
                      <CountdownTimer targetDate={item.launchDate} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditWatch(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                          title="Edit Priority, Reminder & Notes"
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

      {/* ══════════════════════════════════════════════════
           MY SPACE JOURNAL (Full CRUD + Search + View Details)
         ══════════════════════════════════════════════════ */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        {/* Header + Add Journal Entry Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">My Space Journal</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Record your space discoveries, Mars rover sightings, and personal astronomical observations.
            </p>
          </div>

          <button
            onClick={() => setIsAddNoteOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-glow-cyan hover:opacity-95 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Journal Entry</span>
          </button>
        </div>

        {/* Search, Category Filter & Sort Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={journalSearch}
              onChange={(e) => setJournalSearch(e.target.value)}
              placeholder="Search journal by title, description, or personal notes..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Pills */}
            {[
              { key: 'all', label: 'All' },
              { key: 'apod', label: 'APOD' },
              { key: 'mars', label: 'Mars' },
              { key: 'launch', label: 'Launches' },
              { key: 'satellite', label: 'Satellites' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setJournalCategory(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                  journalCategory === key
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}

            {/* Sort Controls */}
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-800">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              {[
                { key: 'newest', label: 'Newest' },
                { key: 'oldest', label: 'Oldest' },
                { key: 'az', label: 'A–Z' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFavSort(key)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition border ${
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
        </div>

        {/* Journal Cards Grid */}
        {journalEntries.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs space-y-2">
            <p>
              {journalSearch || journalCategory !== 'all'
                ? 'No space journal entries match your current search or filter.'
                : 'Your Space Journal is empty. Click "Add Journal Entry" above or save discoveries from the NASA Explorer!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journalEntries.map((fav) => (
              <div
                key={fav._id}
                className="glass-panel rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition"
              >
                {fav.imageUrl && (
                  <div
                    onClick={() => setViewFavItem(fav)}
                    className="h-40 w-full overflow-hidden bg-black cursor-pointer relative"
                  >
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
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                        {fav.itemType}
                      </span>
                      <span>{new Date(fav.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 line-clamp-1 mt-1">{fav.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{fav.description}</p>
                    {fav.notes && (
                      <div className="mt-2 p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300 line-clamp-2 italic">
                        📝 {fav.notes}
                      </div>
                    )}
                  </div>

                  {/* Card Actions: View Details | Edit | Delete */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[11px]">
                    <button
                      onClick={() => setViewFavItem(fav)}
                      className="flex items-center gap-1 text-slate-300 hover:text-cyan-400 font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditFav(fav)}
                        className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition"
                        title="Edit journal entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => requestDelete('favorite', fav._id, fav.title)}
                        className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition"
                        title="Delete journal entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
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

      {/* Add Space Journal Entry Modal (CREATE) */}
      <Modal isOpen={isAddNoteOpen} onClose={() => { setIsAddNoteOpen(false); setNoteErrors({}); }} title="Add Space Journal Entry" maxWidth="max-w-lg">
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Discovery / Entry Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => { setNoteTitle(e.target.value); setNoteErrors((p) => ({ ...p, title: '' })); }}
              placeholder="e.g., Perseverance Mastcam Ridge Observation"
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border text-sm text-slate-100 focus:outline-none transition ${
                noteErrors.title ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
              }`}
            />
            {noteErrors.title && <p className="text-[11px] text-rose-400 mt-1">{noteErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="text-xs font-semibold text-slate-300 block mb-1">Image URL (Optional)</label>
              <input
                type="url"
                value={noteImageUrl}
                onChange={(e) => setNoteImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Observation Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={noteDescription}
              onChange={(e) => { setNoteDescription(e.target.value); setNoteErrors((p) => ({ ...p, description: '' })); }}
              placeholder="Describe the celestial object, Mars photograph, or mission event..."
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border text-sm text-slate-100 focus:outline-none transition ${
                noteErrors.description ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
              }`}
            />
            {noteErrors.description && <p className="text-[11px] text-rose-400 mt-1">{noteErrors.description}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Personal Research Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notePersonalNotes}
              onChange={(e) => setNotePersonalNotes(e.target.value)}
              maxLength={500}
              placeholder="Add your own hypotheses, coordinates, or follow-up reminders..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setIsAddNoteOpen(false); setNoteErrors({}); }}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={isSavingNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition">
              <Save className="w-3.5 h-3.5" />
              {isSavingNote ? 'Saving...' : 'Save Journal Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Space Journal Entry Details Modal (READ Details) */}
      <Modal
        isOpen={!!viewFavItem}
        onClose={() => setViewFavItem(null)}
        title={viewFavItem?.title || 'Journal Entry Details'}
        maxWidth="max-w-2xl"
      >
        {viewFavItem && (
          <div className="space-y-5">
            {viewFavItem.imageUrl && (
              <div className="max-h-80 w-full overflow-hidden rounded-xl bg-black border border-slate-800 flex items-center justify-center">
                <img
                  src={viewFavItem.imageUrl}
                  alt={viewFavItem.title}
                  className="max-h-80 w-auto object-contain"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 font-bold uppercase">
                Category: {viewFavItem.itemType}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Logged on {new Date(viewFavItem.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Discovery Description
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {viewFavItem.description || 'No description provided.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                Personal Astronaut Observations
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed italic">
                {viewFavItem.notes
                  ? `“${viewFavItem.notes}”`
                  : 'No personal observations added yet. Click "Edit Entry" below to record your thoughts.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewFavItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = viewFavItem;
                  setViewFavItem(null);
                  openEditFav(item);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Journal Entry</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Space Journal Entry Modal (UPDATE) */}
      <Modal isOpen={!!editFavItem} onClose={() => setEditFavItem(null)} title="Edit Space Journal Entry" maxWidth="max-w-lg">
        {editFavItem && (
          <form onSubmit={handleUpdateFav} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Entry Title</label>
                <input
                  type="text"
                  value={editFavTitle}
                  onChange={(e) => setEditFavTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={editFavCategory}
                  onChange={(e) => setEditFavCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="apod">APOD</option>
                  <option value="mars">Mars</option>
                  <option value="launch">Launch</option>
                  <option value="satellite">Satellite</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
              <textarea
                rows={3}
                value={editFavDescription}
                onChange={(e) => setEditFavDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Personal Observations / Notes</label>
              <textarea
                rows={3}
                value={editFavNotes}
                onChange={(e) => setEditFavNotes(e.target.value)}
                maxLength={500}
                placeholder="Add your personal observations, thoughts, or research notes..."
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
                {isSavingFav ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Watchlist Item Modal (UPDATE Priority, Reminder & Notes) */}
      <Modal isOpen={!!editWatchItem} onClose={() => setEditWatchItem(null)} title="Edit Mission Priority & Reminder" maxWidth="max-w-md">
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
              <label className="text-xs font-semibold text-slate-300 block mb-1">Launch Reminder</label>
              <select
                value={editWatchReminder}
                onChange={(e) => setEditWatchReminder(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="none">No Reminder</option>
                <option value="15m">15 Minutes Before Liftoff</option>
                <option value="1h">1 Hour Before Launch</option>
                <option value="24h">1 Day (24 Hours) Before Launch</option>
              </select>
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
                from your {deleteTarget.type === 'favorite' ? 'Space Journal' : 'Watchlist'}?
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
