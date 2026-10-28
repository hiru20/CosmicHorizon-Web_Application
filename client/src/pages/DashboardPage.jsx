import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import Tag from '../components/common/Tag';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Stat from '../components/common/Stat';
import EmptyState from '../components/common/EmptyState';
import LiveDot from '../components/common/LiveDot';
import SectionHeader from '../components/common/SectionHeader';
import AnimatedNumber from '../components/common/AnimatedNumber';
import Skeleton, { SkeletonRows } from '../components/common/Skeleton';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import JournalCard from '../components/dashboard/JournalCard';
import MissionCard from '../components/dashboard/MissionCard';
import TMinus from '../components/dashboard/TMinus';
import { Edit3, Plus, Save, Search, Trash2, AlertTriangle, ArrowUpRight } from 'lucide-react';

// Active style for the priority selector (single accent)
const priorityColors = {
  high: 'border-signal text-signal bg-signal-dim',
  medium: 'border-signal text-signal bg-signal-dim',
  low: 'border-signal text-signal bg-signal-dim',
};

// Mission board columns (display grouping only)
const BOARD_COLUMNS = [
  { key: 'high', code: 'P1', label: 'High priority' },
  { key: 'medium', code: 'P2', label: 'Medium priority' },
  { key: 'low', code: 'P3', label: 'Low priority' },
];

const JOURNAL_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'apod', label: 'APOD' },
  { key: 'mars', label: 'Mars' },
  { key: 'launch', label: 'Launches' },
  { key: 'satellite', label: 'Satellites' },
];

const JOURNAL_SORTS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'az', label: 'Title A–Z' },
];

const pad2 = (n) => String(n).padStart(2, '0');
const logStamp = (d) => {
  if (!d) return '—';
  const t = new Date(d);
  return `${t.getFullYear()}.${pad2(t.getMonth() + 1)}.${pad2(t.getDate())} ${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
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

  // ----- UI-only: which dashboard section is visible -----
  const [activeTab, setActiveTab] = useState('overview');

  // ============================================================
  //  RENDER
  // ============================================================
  if (loading) {
    return (
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14" role="status" aria-label="Loading your dashboard">
        <div className="grid grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-8">
          <div className="hidden lg:block col-span-3 xl:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
            <div className="border-t border-line">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="py-4 border-b border-line">
                  <Skeleton className="h-2.5 w-2/3" />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-10">
            <div className="space-y-6">
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-16 w-2/3 sm:w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 border border-line divide-y sm:divide-y-0 sm:divide-x divide-line">
              {[0, 1, 2].map((i) => (
                <div key={i} className="p-6 space-y-4">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-14 w-20" />
                </div>
              ))}
            </div>
            <SkeletonRows rows={4} cols={3} />
          </div>
        </div>
      </div>
    );
  }

  const { metrics, nextLaunch, watchlistItems } = dashboardData || {};
  const journalEntries = getFilteredJournalEntries();

  // Display-only derivations (no data is mutated)
  const recentActivity = [
    ...(dashboardData?.recentFavorites || []).map((f) => ({
      key: `fav-${f._id}`,
      kind: 'journal',
      title: f.title,
      meta: f.itemType,
      at: f.createdAt,
    })),
    ...(watchlistItems || []).map((w) => ({
      key: `watch-${w._id}`,
      kind: 'watchlist',
      title: w.launchName,
      meta: w.agency,
      at: w.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
    .slice(0, 6);

  const boardColumns = BOARD_COLUMNS.map((col) => ({
    ...col,
    items: (watchlistItems || []).filter((item) => {
      const p = BOARD_COLUMNS.some((c) => c.key === item.priority) ? item.priority : 'medium';
      return p === col.key;
    }),
  }));

  const hasJournalFilter = !!journalSearch || journalCategory !== 'all';

  const tabs = [
    { id: 'overview', index: '01', label: 'Overview' },
    { id: 'favorites', index: '02', label: 'Favorites', count: metrics?.totalFavorites || 0 },
    { id: 'watchlist', index: '03', label: 'Watchlist', count: watchlistItems?.length || 0 },
    { id: 'settings', index: '04', label: 'Settings' },
  ];

  const avatarSrc = user?.avatar || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200';
  const joinedOn = new Date(user?.createdAt || Date.now()).toLocaleDateString();

  return (
    <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-14">
      <div className="grid grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-8 items-start">
        {/* ── Left rail / mobile tab strip ── */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 lg:sticky lg:top-24 min-w-0 space-y-6">
          <div className="flex items-center gap-3">
            <img src={avatarSrc} alt="" className="w-10 h-10 object-cover grayscale border border-line-strong" />
            <div className="min-w-0">
              <p className="text-sm text-fg truncate">{user?.name}</p>
              <LiveDot label="Flight ready" />
            </div>
          </div>
          <DashboardTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <p className="hidden lg:block font-mono text-[0.625rem] leading-relaxed text-fg-faint uppercase tracking-label">
            Mission log
            <br />
            Joined {joinedOn}
          </p>
        </aside>

        <div className="col-span-12 lg:col-span-9 xl:col-span-10 min-w-0">
          {/* ══════════════════ 01 OVERVIEW ══════════════════ */}
          {activeTab === 'overview' && (
            <section id="dashboard-panel-overview" role="tabpanel" aria-labelledby="dashboard-tab-overview" className="space-y-12 animate-fade-in">
              <SectionHeader
                index="01"
                eyebrow="Mission log / overview"
                size="md"
                title={user?.name}
                description={user?.bio || 'Space enthusiast exploring the cosmos with CosmicHorizon.'}
                actions={
                  <Button variant="secondary" size="sm" icon={Edit3} onClick={() => setIsEditModalOpen(true)}>
                    Edit profile
                  </Button>
                }
              />

              <dl className="flex flex-wrap gap-x-8 gap-y-2 -mt-6 font-mono text-[0.6875rem]">
                <div className="flex gap-2">
                  <dt className="text-fg-faint uppercase tracking-label">Callsign</dt>
                  <dd className="text-fg-muted break-all">{user?.email}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-fg-faint uppercase tracking-label">Joined</dt>
                  <dd className="text-fg-muted">{joinedOn}</dd>
                </div>
              </dl>

              {/* ── Bento: stats + next launch + activity ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 border border-line">
                <div className="lg:col-span-2 p-6 sm:p-8 border-b sm:border-r border-line">
                  <Stat
                    label="Watchlist / tracked launches"
                    size="xl"
                    accent
                    value={<AnimatedNumber value={metrics?.totalWatchlist || 0} format={(n) => pad2(Math.round(n))} />}
                  />
                </div>
                <div className="lg:col-span-2 p-6 sm:p-8 border-b lg:border-r border-line">
                  <Stat
                    label="Journal / saved entries"
                    size="xl"
                    value={<AnimatedNumber value={metrics?.totalFavorites || 0} format={(n) => pad2(Math.round(n))} />}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-2 p-6 sm:p-8 border-b border-line flex flex-col justify-between gap-6">
                  <span className="label">Classification</span>
                  <div>
                    <p className="font-display text-4xl leading-none text-fg">Cosmic Explorer</p>
                    <p className="font-mono text-[0.6875rem] text-fg-muted mt-3">Cadet status since {joinedOn}</p>
                  </div>
                </div>

                {/* Next tracked launch */}
                <div className="sm:col-span-2 lg:col-span-6 p-6 sm:p-8 border-b border-line">
                  {nextLaunch ? (
                    <div className="grid grid-cols-12 gap-6 items-end">
                      <div className="col-span-12 xl:col-span-6 space-y-4">
                        <span className="label">Next tracked launch</span>
                        <h2 className="font-display text-display-sm text-fg">{nextLaunch.launchName}</h2>
                        <p className="font-mono text-[0.6875rem] text-fg-muted">
                          {nextLaunch.rocket} / {nextLaunch.agency}
                          {nextLaunch.padLocation && <span className="text-fg-faint"> — {nextLaunch.padLocation}</span>}
                        </p>
                      </div>
                      <div className="col-span-12 xl:col-span-6 xl:justify-self-end">
                        <TMinus targetDate={nextLaunch.launchDate} size="lg" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <span className="label">Next tracked launch</span>
                        <p className="font-display text-3xl text-fg-muted">No launch on the board.</p>
                      </div>
                      <Button variant="secondary" size="sm" to="/launches" iconRight={ArrowUpRight}>
                        Open manifest
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recent activity: ruled log */}
                <div className="sm:col-span-2 lg:col-span-6">
                  <div className="flex items-center justify-between px-6 sm:px-8 h-11 border-b border-line">
                    <h2 className="label text-fg">Recent activity</h2>
                    <span className="label text-fg-faint">{pad2(recentActivity.length)} entries</span>
                  </div>
                  {recentActivity.length === 0 ? (
                    <p className="px-6 sm:px-8 py-8 text-sm text-fg-muted">
                      No activity yet. Save a discovery from the NASA gallery or track a launch to start your mission log.
                    </p>
                  ) : (
                    <ol className="divide-y divide-line">
                      {recentActivity.map((a) => (
                        <li
                          key={a.key}
                          className="grid grid-cols-[auto_1fr] sm:grid-cols-[9.5rem_5.5rem_1fr_auto] gap-x-4 gap-y-1 items-baseline px-6 sm:px-8 py-3.5 hover:bg-ink-900 transition-colors"
                        >
                          <time className="font-mono text-[0.6875rem] text-fg-faint tabular-nums" dateTime={a.at}>
                            {logStamp(a.at)}
                          </time>
                          <span className="justify-self-end sm:justify-self-start">
                            <Tag variant={a.kind === 'journal' ? 'neutral' : 'signal'}>{a.kind === 'journal' ? 'Journal' : 'Watch'}</Tag>
                          </span>
                          <p className="col-span-2 sm:col-span-1 text-sm text-fg truncate">{a.title}</p>
                          {a.meta && (
                            <span className="hidden sm:inline font-mono text-[0.625rem] uppercase tracking-label text-fg-faint">{a.meta}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════ 02 FAVORITES / SPACE JOURNAL (Full CRUD) ══════════════════ */}
          {activeTab === 'favorites' && (
            <section id="dashboard-panel-favorites" role="tabpanel" aria-labelledby="dashboard-tab-favorites" className="space-y-8 animate-fade-in">
              <SectionHeader
                index="02"
                eyebrow="Saved discoveries"
                size="md"
                title={
                  <>
                    Space <span className="italic text-fg-muted">journal</span>
                  </>
                }
                description="Record your space discoveries, Mars rover sightings, and personal astronomical observations."
                actions={
                  <Button icon={Plus} size="sm" onClick={() => setIsAddNoteOpen(true)}>
                    Add entry
                  </Button>
                }
              />

              {/* Toolbar: search / category / sort */}
              <div className="grid grid-cols-12 gap-x-6 gap-y-5 items-end border-y border-line py-5">
                <label className="col-span-12 lg:col-span-5 relative group/field">
                  <span className="label block mb-1 group-focus-within/field:text-signal">Search journal</span>
                  <Search className="absolute left-0 bottom-3 w-4 h-4 text-fg-faint" strokeWidth={1.5} aria-hidden="true" />
                  <input
                    type="text"
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                    placeholder="Title, description or notes"
                    className="field pl-7"
                  />
                </label>

                <div className="col-span-12 sm:col-span-8 lg:col-span-5">
                  <span className="label block mb-2" id="journal-category-label">
                    Category
                  </span>
                  <div className="flex flex-wrap border border-line w-max max-w-full" role="group" aria-labelledby="journal-category-label">
                    {JOURNAL_CATEGORIES.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={journalCategory === key}
                        onClick={() => setJournalCategory(key)}
                        className={`h-9 px-3 font-mono text-[0.625rem] uppercase tracking-label border-r border-line last:border-r-0 transition-colors ${
                          journalCategory === key ? 'bg-fg text-black' : 'text-fg-muted hover:text-fg hover:bg-ink-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-4 lg:col-span-2">
                  <Input as="select" label="Sort" value={favSort} onChange={(e) => setFavSort(e.target.value)} inputClassName="font-mono text-xs uppercase tracking-label">
                    {JOURNAL_SORTS.map(({ key, label }) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Input>
                </div>
              </div>

              <p className="label text-fg-faint -mt-4" aria-live="polite">
                Showing {pad2(journalEntries.length)} {journalEntries.length === 1 ? 'entry' : 'entries'}
              </p>

              {journalEntries.length === 0 ? (
                hasJournalFilter ? (
                  <EmptyState
                    code="ERR 404 — NO MATCH"
                    title="Nothing in the log matches that query."
                    description="No space journal entries match your current search or category."
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setJournalSearch('');
                          setJournalCategory('all');
                        }}
                      >
                        Clear search &amp; filter
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    code="LOG EMPTY"
                    title="The journal has no entries yet."
                    description='Use "Add entry" to record an observation, or save discoveries from the NASA gallery.'
                    action={
                      <>
                        <Button icon={Plus} size="sm" onClick={() => setIsAddNoteOpen(true)}>
                          Add entry
                        </Button>
                        <Button variant="secondary" size="sm" to="/nasa" iconRight={ArrowUpRight}>
                          Open gallery
                        </Button>
                      </>
                    }
                  />
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {journalEntries.map((fav, i) => (
                    <JournalCard
                      key={fav._id}
                      fav={fav}
                      featured={i === 0 && journalEntries.length > 2}
                      onView={setViewFavItem}
                      onEdit={openEditFav}
                      onDelete={(f) => requestDelete('favorite', f._id, f.title)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ══════════════════ 03 WATCHLIST: MISSION BOARD ══════════════════ */}
          {activeTab === 'watchlist' && (
            <section id="dashboard-panel-watchlist" role="tabpanel" aria-labelledby="dashboard-tab-watchlist" className="space-y-8 animate-fade-in">
              <SectionHeader
                index="03"
                eyebrow={`${pad2(watchlistItems?.length || 0)} missions tracked`}
                size="md"
                title={
                  <>
                    Mission <span className="italic text-fg-muted">board</span>
                  </>
                }
                description="Tracked launches grouped by priority, with reminders and live T-minus counts."
                actions={
                  <Button variant="secondary" size="sm" to="/launches" iconRight={ArrowUpRight}>
                    Launch manifest
                  </Button>
                }
              />

              {!watchlistItems || watchlistItems.length === 0 ? (
                <EmptyState
                  code="BOARD CLEAR"
                  title="No missions on the board."
                  description="Track upcoming rocket launches from the manifest and set reminders; they will appear here by priority."
                  action={
                    <Button size="sm" to="/launches" iconRight={ArrowUpRight}>
                      Browse launches
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 border border-line divide-y lg:divide-y-0 lg:divide-x divide-line">
                  {boardColumns.map((col) => (
                    <div key={col.key} className="min-w-0">
                      <div className="flex items-center justify-between px-4 sm:px-5 h-11 border-b border-line bg-ink-900">
                        <h3 className="flex items-baseline gap-2.5 label text-fg">
                          <span className={col.key === 'high' ? 'text-signal' : 'text-fg-faint'}>{col.code}</span>
                          {col.label}
                        </h3>
                        <span className="telemetry text-[0.6875rem] text-fg-muted">{pad2(col.items.length)}</span>
                      </div>
                      {col.items.length === 0 ? (
                        <p className="label text-fg-faint text-center py-10">— No missions —</p>
                      ) : (
                        <div className="divide-y divide-line">
                          {col.items.map((item) => (
                            <MissionCard
                              key={item._id}
                              item={item}
                              onEdit={openEditWatch}
                              onRemove={(w) => requestDelete('watchlist', w._id, w.launchName)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ══════════════════ 04 SETTINGS ══════════════════ */}
          {activeTab === 'settings' && (
            <section id="dashboard-panel-settings" role="tabpanel" aria-labelledby="dashboard-tab-settings" className="space-y-8 animate-fade-in">
              <SectionHeader index="04" eyebrow="Account" size="md" title="Settings" />

              <div className="grid grid-cols-12 gap-x-6 gap-y-8">
                <div className="col-span-12 md:col-span-4 xl:col-span-3 space-y-5">
                  <img src={avatarSrc} alt={user?.name} className="w-32 h-32 object-cover grayscale border border-line-strong" />
                  <Button icon={Edit3} size="sm" onClick={() => setIsEditModalOpen(true)}>
                    Edit profile
                  </Button>
                </div>

                <dl className="col-span-12 md:col-span-8 xl:col-span-9 border-t border-line">
                  {[
                    { label: 'Call sign / name', value: <span className="font-display text-3xl leading-none">{user?.name}</span> },
                    { label: 'Email', value: <span className="font-mono text-sm break-all">{user?.email}</span> },
                    { label: 'Mission bio', value: <span className="text-sm text-fg-muted leading-relaxed">{user?.bio || 'Space enthusiast exploring the cosmos with CosmicHorizon.'}</span> },
                    { label: 'Joined', value: <span className="font-mono text-sm">{joinedOn}</span> },
                  ].map((row) => (
                    <div key={row.label} className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-x-6 gap-y-1.5 py-5 border-b border-line">
                      <dt className="label">{row.label}</dt>
                      <dd className="text-fg">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
           MODALS
         ══════════════════════════════════════════════════ */}

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update astronaut profile" maxWidth="max-w-md">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <Input
            label="Call sign / name"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            required
            minLength={2}
          />
          <Input
            as="textarea"
            label="Mission bio"
            rows={3}
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            placeholder="Your astronomy research interests..."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isUpdating} loading={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Space Journal Entry Modal (CREATE) */}
      <Modal isOpen={isAddNoteOpen} onClose={() => { setIsAddNoteOpen(false); setNoteErrors({}); }} title="New journal entry" maxWidth="max-w-lg">
        <form onSubmit={handleAddNote} className="space-y-6">
          <Input
            label={<>Discovery / entry title <span className="text-signal" aria-hidden="true">*</span></>}
            type="text"
            value={noteTitle}
            onChange={(e) => { setNoteTitle(e.target.value); setNoteErrors((p) => ({ ...p, title: '' })); }}
            placeholder="e.g., Perseverance Mastcam Ridge Observation"
            error={noteErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              as="select"
              label="Category"
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value)}
            >
              <option value="apod">APOD – Astronomy Picture</option>
              <option value="mars">Mars – Rover Observation</option>
              <option value="launch">Launch – Mission Note</option>
              <option value="satellite">Satellite – Tracking Note</option>
            </Input>

            <Input
              label="Image URL (optional)"
              type="url"
              value={noteImageUrl}
              onChange={(e) => setNoteImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Input
            as="textarea"
            label={<>Observation description <span className="text-signal" aria-hidden="true">*</span></>}
            rows={3}
            value={noteDescription}
            onChange={(e) => { setNoteDescription(e.target.value); setNoteErrors((p) => ({ ...p, description: '' })); }}
            placeholder="Describe the celestial object, Mars photograph, or mission event..."
            error={noteErrors.description}
          />

          <Input
            as="textarea"
            label="Personal research notes (optional)"
            rows={2}
            value={notePersonalNotes}
            onChange={(e) => setNotePersonalNotes(e.target.value)}
            maxLength={500}
            placeholder="Add your own hypotheses, coordinates, or follow-up reminders..."
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <Button variant="ghost" size="sm" onClick={() => { setIsAddNoteOpen(false); setNoteErrors({}); }}>
              Cancel
            </Button>
            <Button type="submit" size="sm" icon={Save} disabled={isSavingNote} loading={isSavingNote}>
              {isSavingNote ? 'Saving...' : 'Save Journal Entry'}
            </Button>
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
          <div className="space-y-6">
            {viewFavItem.imageUrl && (
              <div className="max-h-80 w-full overflow-hidden bg-black border border-line flex items-center justify-center">
                <img
                  src={viewFavItem.imageUrl}
                  alt={viewFavItem.title}
                  className="max-h-80 w-auto object-contain"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Tag variant="signal">Category: {viewFavItem.itemType}</Tag>
              <span className="label text-fg-faint">
                Logged {new Date(viewFavItem.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h4 className="label mb-2">Discovery description</h4>
              <p className="text-sm text-fg leading-relaxed whitespace-pre-line">
                {viewFavItem.description || 'No description provided.'}
              </p>
            </div>

            <div className="border-l border-signal pl-5">
              <h4 className="label mb-2">Personal observations</h4>
              <p className="font-display text-2xl leading-snug text-fg italic">
                {viewFavItem.notes
                  ? `“${viewFavItem.notes}”`
                  : 'No personal observations added yet. Click "Edit Entry" below to record your thoughts.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setViewFavItem(null)}>
                Close
              </Button>
              <Button
                size="sm"
                icon={Edit3}
                onClick={() => {
                  const item = viewFavItem;
                  setViewFavItem(null);
                  openEditFav(item);
                }}
              >
                Edit Journal Entry
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Space Journal Entry Modal (UPDATE) */}
      <Modal isOpen={!!editFavItem} onClose={() => setEditFavItem(null)} title="Edit journal entry" maxWidth="max-w-lg">
        {editFavItem && (
          <form onSubmit={handleUpdateFav} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                className="sm:col-span-2"
                label="Entry title"
                type="text"
                value={editFavTitle}
                onChange={(e) => setEditFavTitle(e.target.value)}
                required
              />

              <Input
                as="select"
                label="Category"
                value={editFavCategory}
                onChange={(e) => setEditFavCategory(e.target.value)}
              >
                <option value="apod">APOD</option>
                <option value="mars">Mars</option>
                <option value="launch">Launch</option>
                <option value="satellite">Satellite</option>
              </Input>
            </div>

            <Input
              as="textarea"
              label="Description"
              rows={3}
              value={editFavDescription}
              onChange={(e) => setEditFavDescription(e.target.value)}
            />

            <div>
              <Input
                as="textarea"
                label="Personal observations / notes"
                rows={3}
                value={editFavNotes}
                onChange={(e) => setEditFavNotes(e.target.value)}
                maxLength={500}
                placeholder="Add your personal observations, thoughts, or research notes..."
              />
              <p className="font-mono text-[0.625rem] text-fg-faint mt-1.5 text-right tabular-nums">{editFavNotes.length}/500</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setEditFavItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSavingFav} loading={isSavingFav}>
                {isSavingFav ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Watchlist Item Modal (UPDATE Priority, Reminder & Notes) */}
      <Modal isOpen={!!editWatchItem} onClose={() => setEditWatchItem(null)} title="Mission priority & reminder" maxWidth="max-w-md">
        {editWatchItem && (
          <form onSubmit={handleUpdateWatch} className="space-y-6">
            <p className="font-mono text-[0.6875rem] text-fg-muted">
              <span className="text-fg-faint uppercase tracking-label">Editing — </span>
              <span className="text-fg">{editWatchItem.launchName}</span>
            </p>

            <fieldset>
              <legend className="label mb-2">Mission priority</legend>
              <div className="grid grid-cols-3 border border-line">
                {['high', 'medium', 'low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={editWatchPriority === p}
                    onClick={() => setEditWatchPriority(p)}
                    className={`h-10 border font-mono text-[0.625rem] uppercase tracking-label transition-colors ${
                      editWatchPriority === p ? priorityColors[p] : 'border-transparent text-fg-muted hover:text-fg hover:bg-ink-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>

            <Input
              as="select"
              label="Launch reminder"
              value={editWatchReminder}
              onChange={(e) => setEditWatchReminder(e.target.value)}
            >
              <option value="none">No Reminder</option>
              <option value="15m">15 Minutes Before Liftoff</option>
              <option value="1h">1 Hour Before Launch</option>
              <option value="24h">1 Day (24 Hours) Before Launch</option>
            </Input>

            <div>
              <Input
                as="textarea"
                label="Mission notes"
                rows={3}
                value={editWatchNotes}
                onChange={(e) => setEditWatchNotes(e.target.value)}
                maxLength={500}
                placeholder="Add notes about this launch, e.g., expected payload, viewing location..."
              />
              <p className="font-mono text-[0.625rem] text-fg-faint mt-1.5 text-right tabular-nums">{editWatchNotes.length}/500</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setEditWatchItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSavingWatch} loading={isSavingWatch}>
                {isSavingWatch ? 'Saving...' : 'Update Mission'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm removal" maxWidth="max-w-sm">
        {deleteTarget && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 border-l border-danger pl-4">
              <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm text-fg leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-display text-lg italic">"{deleteTarget.name}"</span>{' '}
                from your {deleteTarget.type === 'favorite' ? 'Space Journal' : 'Watchlist'}?
              </p>
            </div>
            <p className="label text-fg-faint">This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger-solid"
                size="sm"
                icon={Trash2}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                loading={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Yes, Remove'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
