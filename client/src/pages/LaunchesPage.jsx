import React, { useState, useEffect, useCallback } from 'react';
import { spaceService } from '../services/spaceService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import LaunchFilter from '../components/launches/LaunchFilter';
import LaunchCard, { LaunchStatusTag, MANIFEST_COLUMNS } from '../components/launches/LaunchCard';
import CountdownTimer from '../components/launches/CountdownTimer';
import WatchToggle from '../components/launches/WatchToggle';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';
import LiveDot from '../components/common/LiveDot';
import EmptyState from '../components/common/EmptyState';
import { SkeletonRows } from '../components/common/Skeleton';
import { Bell, BellRing } from 'lucide-react';

const REMINDER_OPTIONS = [
  { key: '15m', label: '15 Minutes Before Liftoff', desc: 'Final terminal count alert' },
  { key: '1h', label: '1 Hour Before Launch', desc: 'Propellant loading & webcast start' },
  { key: '24h', label: '1 Day (24 Hours) Before Launch', desc: 'Day-before mission readiness reminder' },
];

const LaunchesPage = () => {
  const { isAuthenticated } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [reminders, setReminders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cosmic_launch_reminders') || '{}');
    } catch {
      return {};
    }
  });

  // Filter states
  const [search, setSearch] = useState('');
  const [agency, setAgency] = useState('all');
  const [status, setStatus] = useState('all');

  // Modals
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [reminderModalLaunch, setReminderModalLaunch] = useState(null);
  const [selectedReminderTime, setSelectedReminderTime] = useState('1h');
  const [savingReminder, setSavingReminder] = useState(false);

  // UI only: which manifest row is expanded
  const [expandedId, setExpandedId] = useState(null);

  // Fetch launches
  const fetchLaunches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await spaceService.getUpcomingLaunches({
        search,
        agency: agency === 'all' ? undefined : agency,
        status: status === 'all' ? undefined : status,
      });
      setLaunches(data.launches || []);
    } catch (error) {
      console.error('Error fetching launches:', error);
      notifyError('Failed to fetch rocket launches');
    } finally {
      setLoading(false);
    }
  }, [search, agency, status, notifyError]);

  // Fetch User Watchlist IDs and persisted reminders
  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWatchlistIds(new Set());
      return;
    }
    try {
      const items = await userService.getWatchlist();
      const ids = new Set((items || []).map((i) => String(i.launchId)));
      setWatchlistIds(ids);

      // Sync any server-saved reminders
      setReminders((prev) => {
        const merged = { ...prev };
        (items || []).forEach((item) => {
          if (item.reminderTime && item.reminderTime !== 'none') {
            merged[String(item.launchId)] = item.reminderTime;
          }
        });
        localStorage.setItem('cosmic_launch_reminders', JSON.stringify(merged));
        return merged;
      });
    } catch (error) {
      console.warn('Could not sync user watchlist:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLaunches();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchLaunches]);

  // Toggle Watchlist handler
  const handleToggleWatchlist = async (launch) => {
    if (!isAuthenticated) {
      notifyInfo('Please log in or register to add missions to your Watchlist.');
      return;
    }

    const launchIdStr = String(launch.id);
    const isInWatchlist = watchlistIds.has(launchIdStr);

    try {
      if (isInWatchlist) {
        await userService.removeFromWatchlist(launchIdStr);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(launchIdStr);
          return next;
        });
        notifySuccess(`Removed "${launch.name}" from your Watchlist`);
      } else {
        await userService.addToWatchlist({
          launchId: launchIdStr,
          launchName: launch.name,
          launchDate: launch.net || new Date().toISOString(),
          agency: launch.launch_service_provider?.name || 'Space Agency',
          rocket: launch.rocket?.configuration?.full_name || 'Rocket',
          padLocation: launch.pad?.location?.name || '',
          status: launch.status?.name || 'Go',
          image: launch.image || '',
          reminderTime: reminders[launchIdStr] || 'none',
        });
        setWatchlistIds((prev) => new Set([...prev, launchIdStr]));
        notifySuccess(`Added "${launch.name}" to your Watchlist!`);
      }
    } catch (error) {
      notifyError(error.message || 'Failed to update Watchlist');
    }
  };

  // Open Reminder Modal for a launch
  const handleOpenReminder = (launch) => {
    const current = reminders[String(launch.id)] || '1h';
    setSelectedReminderTime(current === 'none' ? '1h' : current);
    setReminderModalLaunch(launch);
  };

  // Save or clear a launch reminder
  const handleSaveReminder = async (timeKey) => {
    if (!reminderModalLaunch) return;
    setSavingReminder(true);
    const launchIdStr = String(reminderModalLaunch.id);

    try {
      // Request browser notification permission if setting a reminder
      if (timeKey !== 'none' && 'Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch {
          // ignore permission prompt errors
        }
      }

      // Persist in localStorage
      const updated = { ...reminders };
      if (timeKey === 'none') {
        delete updated[launchIdStr];
      } else {
        updated[launchIdStr] = timeKey;
      }
      setReminders(updated);
      localStorage.setItem('cosmic_launch_reminders', JSON.stringify(updated));

      // If authenticated, also ensure the launch is in the user's Watchlist with reminderTime stored in MongoDB
      if (isAuthenticated) {
        if (!watchlistIds.has(launchIdStr) && timeKey !== 'none') {
          await userService.addToWatchlist({
            launchId: launchIdStr,
            launchName: reminderModalLaunch.name,
            launchDate: reminderModalLaunch.net || new Date().toISOString(),
            agency: reminderModalLaunch.launch_service_provider?.name || 'Space Agency',
            rocket: reminderModalLaunch.rocket?.configuration?.full_name || 'Rocket',
            padLocation: reminderModalLaunch.pad?.location?.name || '',
            status: reminderModalLaunch.status?.name || 'Go',
            image: reminderModalLaunch.image || '',
            reminderTime: timeKey,
          });
          setWatchlistIds((prev) => new Set([...prev, launchIdStr]));
        } else if (watchlistIds.has(launchIdStr)) {
          await userService.updateWatchlistItem(launchIdStr, { reminderTime: timeKey });
        }
      }

      if (timeKey === 'none') {
        notifyInfo(`Reminder cleared for "${reminderModalLaunch.name}"`);
      } else {
        const optionLabel = REMINDER_OPTIONS.find((o) => o.key === timeKey)?.label || timeKey;
        notifySuccess(`Reminder set (${optionLabel}) for "${reminderModalLaunch.name}"!`);
      }
      setReminderModalLaunch(null);
    } catch (error) {
      notifyError(error.message || 'Could not save reminder');
    } finally {
      setSavingReminder(false);
    }
  };

  // Presentation only: the next launch with a future NET is featured large
  const featuredLaunch = launches.find((l) => l.net && new Date(l.net).getTime() > Date.now()) || null;
  const activeReminderCount = Object.keys(reminders).length;

  return (
    <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-8 space-y-16 sm:space-y-20">
      {/* Page Header */}
      <SectionHeader
        index="03"
        eyebrow="Launch manifest"
        title={
          <>
            Upcoming <span className="italic text-fg-muted">launches</span>
          </>
        }
        description="Global orbital manifest, countdown schedules, and custom launch reminders."
        actions={
          <>
            <LiveDot label={`${launches.length} missions on manifest`} active={!loading} />
            {activeReminderCount > 0 && (
              <Badge variant="signal">
                <BellRing className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
                {activeReminderCount} active reminder{activeReminderCount === 1 ? '' : 's'}
              </Badge>
            )}
          </>
        }
      />

      {/* Next liftoff */}
      {featuredLaunch && !loading && (
        <section aria-labelledby="next-liftoff-title" className="border-y border-line">
          <div className="grid grid-cols-12">
            <div className="col-span-12 lg:col-span-8 py-8 lg:py-10 lg:pr-10 space-y-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.6875rem] text-signal">03.1</span>
                <span className="label">Next liftoff</span>
              </div>
              <h2 id="next-liftoff-title" className="font-display text-display-md text-fg max-w-3xl">
                {featuredLaunch.name}
              </h2>
              <CountdownTimer targetDate={featuredLaunch.net} variant="large" />
            </div>

            <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-line py-8 lg:py-10 lg:pl-10 flex flex-col gap-8">
              <dl className="grid grid-cols-[5.5rem_1fr] gap-y-3 font-mono text-[0.6875rem]">
                <dt className="text-fg-faint uppercase tracking-label">Provider</dt>
                <dd className="text-fg">{featuredLaunch.launch_service_provider?.name || 'Space Provider'}</dd>
                <dt className="text-fg-faint uppercase tracking-label">Vehicle</dt>
                <dd className="text-fg">{featuredLaunch.rocket?.configuration?.full_name || 'Rocket Launcher'}</dd>
                <dt className="text-fg-faint uppercase tracking-label">Pad</dt>
                <dd className="text-fg">{featuredLaunch.pad?.location?.name || 'Spaceport Pad'}</dd>
                <dt className="text-fg-faint uppercase tracking-label">NET</dt>
                <dd className="text-fg">{new Date(featuredLaunch.net).toUTCString().replace('GMT', 'UTC')}</dd>
                <dt className="text-fg-faint uppercase tracking-label">Status</dt>
                <dd>
                  <LaunchStatusTag status={featuredLaunch.status?.name} />
                </dd>
              </dl>
              <div className="flex flex-wrap gap-2 mt-auto">
                <WatchToggle
                  size="md"
                  pressed={watchlistIds.has(String(featuredLaunch.id))}
                  onClick={() => handleToggleWatchlist(featuredLaunch)}
                />
                <Button
                  variant="secondary"
                  icon={reminders[String(featuredLaunch.id)] ? BellRing : Bell}
                  onClick={() => handleOpenReminder(featuredLaunch)}
                >
                  {reminders[String(featuredLaunch.id)] ? 'Reminder on' : 'Remind me'}
                </Button>
                <Button variant="link" onClick={() => setSelectedLaunch(featuredLaunch)} className="ml-2">
                  Full brief
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Toolbar */}
      <section aria-label="Filters" className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.6875rem] text-signal">03.2</span>
          <span className="label">Filter manifest</span>
        </div>
        <LaunchFilter
          search={search}
          setSearch={setSearch}
          agency={agency}
          setAgency={setAgency}
          status={status}
          setStatus={setStatus}
        />
      </section>

      {/* Manifest */}
      <section aria-labelledby="manifest-title" className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.6875rem] text-signal">03.3</span>
          <h2 id="manifest-title" className="label">
            Manifest
          </h2>
          <span className="flex-1 h-px bg-line" aria-hidden="true" />
          {!loading && <span className="label text-fg-faint tabular-nums">{String(launches.length).padStart(2, '0')} entries</span>}
        </div>

        {loading ? (
          <SkeletonRows rows={6} cols={5} />
        ) : launches.length === 0 ? (
          <EmptyState
            code="NO MATCHING ENTRIES"
            title="Nothing on the manifest for this query."
            description="Try adjusting your search keywords, agency filter, or status criteria."
          />
        ) : (
          <div className="border-t border-line">
            {/* Column header (md+) */}
            <div
              className={`hidden md:grid ${MANIFEST_COLUMNS} gap-x-6 px-5 h-10 items-center border-b border-line label text-fg-faint`}
              aria-hidden="true"
            >
              <span>T-minus</span>
              <span>Mission</span>
              <span>Vehicle</span>
              <span>Provider</span>
              <span className="hidden xl:block">Pad</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <ol aria-label="Launch manifest">
              {launches.map((launch, i) => (
                <LaunchCard
                  key={launch.id}
                  index={String(i + 1).padStart(2, '0')}
                  launch={launch}
                  isInWatchlist={watchlistIds.has(String(launch.id))}
                  reminderTime={reminders[String(launch.id)]}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenReminder={handleOpenReminder}
                  onSelectDetails={(l) => setSelectedLaunch(l)}
                  expanded={expandedId === launch.id}
                  onToggleExpand={() => setExpandedId((cur) => (cur === launch.id ? null : launch.id))}
                />
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Set Launch Reminder Modal */}
      <Modal
        isOpen={!!reminderModalLaunch}
        onClose={() => setReminderModalLaunch(null)}
        title="Set launch reminder"
        maxWidth="max-w-md"
      >
        {reminderModalLaunch && (
          <div className="space-y-6">
            <div className="border-l border-signal pl-4 space-y-1">
              <div className="label">{reminderModalLaunch.launch_service_provider?.name || 'Space Launch'}</div>
              <div className="font-display text-2xl leading-tight text-fg">{reminderModalLaunch.name}</div>
              <div className="font-mono text-[0.6875rem] text-fg-muted">
                NET {new Date(reminderModalLaunch.net).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <span className="label block" id="reminder-options-label">
                When should we remind you?
              </span>
              <div role="radiogroup" aria-labelledby="reminder-options-label" className="border-t border-line">
                {REMINDER_OPTIONS.map((opt) => {
                  const checked = selectedReminderTime === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      onClick={() => setSelectedReminderTime(opt.key)}
                      className={`w-full flex items-center gap-4 py-3.5 px-1 border-b border-line text-left transition-colors ${
                        checked ? 'text-fg' : 'text-fg-muted hover:text-fg'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 border flex items-center justify-center flex-shrink-0 ${checked ? 'border-signal' : 'border-line-bright'}`}
                        aria-hidden="true"
                      >
                        {checked && <span className="w-1.5 h-1.5 bg-signal" />}
                      </span>
                      <span className="flex-1">
                        <span className="block font-mono text-xs uppercase tracking-label">{opt.label}</span>
                        <span className="block text-xs text-fg-muted mt-0.5">{opt.desc}</span>
                      </span>
                      <span className="font-mono text-[0.625rem] text-fg-faint uppercase">{opt.key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {reminders[String(reminderModalLaunch.id)] ? (
                <button
                  type="button"
                  disabled={savingReminder}
                  onClick={() => handleSaveReminder('none')}
                  className="link-sweep font-mono text-[0.6875rem] uppercase tracking-label text-danger disabled:opacity-40"
                >
                  Remove reminder
                </button>
              ) : (
                <span className="font-mono text-[0.625rem] text-fg-faint uppercase tracking-label">In-app &amp; watchlist alert</span>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setReminderModalLaunch(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={BellRing}
                  loading={savingReminder}
                  onClick={() => handleSaveReminder(selectedReminderTime)}
                >
                  {savingReminder ? 'Saving...' : 'Save Reminder'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Launch Details Modal */}
      <Modal
        isOpen={!!selectedLaunch}
        onClose={() => setSelectedLaunch(null)}
        title={selectedLaunch?.name || 'Mission Telemetry'}
      >
        {selectedLaunch && (
          <div className="space-y-6">
            <figure className="group relative border border-line overflow-hidden">
              <img
                src={selectedLaunch.image || 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800'}
                alt={selectedLaunch.name}
                className="img-mono w-full h-64 object-cover"
              />
              <figcaption className="absolute top-3 left-3 flex gap-2">
                <LaunchStatusTag status={selectedLaunch.status?.name || 'Scheduled'} />
                {selectedLaunch.webcast_live && (
                  <Badge variant="live">
                    <LiveDot />
                    <span>Live Webcast</span>
                  </Badge>
                )}
              </figcaption>
            </figure>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-7 space-y-2">
                <h4 className="label">Mission overview</h4>
                <p className="text-sm text-fg-muted leading-relaxed">
                  {selectedLaunch.mission?.description || 'Classified orbital insertion or payload deployment.'}
                </p>
              </div>

              <dl className="col-span-12 md:col-span-5 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-6 grid grid-cols-[5.5rem_1fr] gap-y-3 font-mono text-[0.6875rem] content-start">
                <dt className="text-fg-faint uppercase tracking-label">Provider</dt>
                <dd className="text-fg">
                  {selectedLaunch.launch_service_provider?.name} ({selectedLaunch.launch_service_provider?.country_code})
                </dd>
                <dt className="text-fg-faint uppercase tracking-label">Vehicle</dt>
                <dd className="text-fg">{selectedLaunch.rocket?.configuration?.full_name}</dd>
                <dt className="text-fg-faint uppercase tracking-label">Orbit</dt>
                <dd className="text-fg">{selectedLaunch.mission?.orbit?.name || 'Low Earth Orbit (LEO)'}</dd>
                <dt className="text-fg-faint uppercase tracking-label">Pad</dt>
                <dd className="text-fg">
                  {selectedLaunch.pad?.name} — {selectedLaunch.pad?.location?.name}
                </dd>
                <dt className="text-fg-faint uppercase tracking-label">T-minus</dt>
                <dd>
                  <CountdownTimer targetDate={selectedLaunch.net} />
                </dd>
              </dl>
            </div>

            <div className="pt-5 border-t border-line flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                icon={Bell}
                onClick={() => {
                  const l = selectedLaunch;
                  setSelectedLaunch(null);
                  handleOpenReminder(l);
                }}
              >
                Remind Me
              </Button>

              <WatchToggle
                size="md"
                pressed={watchlistIds.has(String(selectedLaunch.id))}
                onClick={() => handleToggleWatchlist(selectedLaunch)}
                labelOn="Remove from Watchlist"
                labelOff="Add to My Watchlist"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LaunchesPage;
