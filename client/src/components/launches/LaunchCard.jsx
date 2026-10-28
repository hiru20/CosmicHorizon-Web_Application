import React, { useId } from 'react';
import { Bell, BellRing, ChevronDown, ArrowUpRight } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import WatchToggle from './WatchToggle';
import Badge from '../common/Badge';
import Button from '../common/Button';

const REMINDER_LABELS = {
  '15m': '15m before',
  '1h': '1h before',
  '24h': '1d before',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800';

const getStatusVariant = (statusName) => {
  const s = (statusName || '').toLowerCase();
  if (s.includes('go')) return 'go';
  if (s.includes('tbd')) return 'tbd';
  if (s.includes('hold')) return 'hold';
  return 'default';
};

/** Outlined mono status chip (go → live, tbd → dashed, hold → danger) */
export const LaunchStatusTag = ({ status }) => <Badge variant={getStatusVariant(status)}>{status || 'Pending'}</Badge>;

// Shared column template for the manifest header and rows (md and up)
export const MANIFEST_COLUMNS =
  'md:grid-cols-[7.5rem_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_7rem_auto] xl:grid-cols-[8rem_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_7rem_auto]';

/**
 * One row of the launch manifest. Collapsed: T-minus, mission, vehicle, provider, pad, status, actions.
 * Expanded: mission brief, imagery and the full set of actions.
 */
const LaunchCard = ({
  launch,
  isInWatchlist,
  reminderTime,
  onToggleWatchlist,
  onOpenReminder,
  onSelectDetails,
  expanded = false,
  onToggleExpand,
  index,
}) => {
  const panelId = useId();

  const formattedDate = launch.net
    ? new Date(launch.net).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBD';

  const hasReminder = reminderTime && reminderTime !== 'none';
  const provider = launch.launch_service_provider?.name || 'Space Provider';
  const rocket = launch.rocket?.configuration?.full_name || 'Rocket Launcher';
  const pad = launch.pad?.location?.name || 'Spaceport Pad';

  const reminderButton = (
    <button
      type="button"
      onClick={() => onOpenReminder && onOpenReminder(launch)}
      aria-label={hasReminder ? `Reminder set (${REMINDER_LABELS[reminderTime] || reminderTime}). Change reminder for ${launch.name}` : `Set launch reminder for ${launch.name}`}
      title={hasReminder ? `Reminder set (${REMINDER_LABELS[reminderTime]})` : 'Set Launch Reminder'}
      className={`h-9 w-9 flex items-center justify-center border transition-colors ${
        hasReminder ? 'border-signal-line text-signal' : 'border-line-strong text-fg-muted hover:text-fg hover:border-fg-muted'
      }`}
    >
      {hasReminder ? <BellRing className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />}
    </button>
  );

  return (
    <li className={`group relative border-b border-line transition-colors ${expanded ? 'surface' : 'hover:bg-ink-800'}`}>
      {/* Left signal hairline on hover / when open */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-px bg-signal origin-top transition-transform duration-300 ease-out ${
          expanded ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'
        }`}
        aria-hidden="true"
      />

      {/* Row */}
      <div className={`grid grid-cols-[5.5rem_minmax(0,1fr)] ${MANIFEST_COLUMNS} gap-x-4 md:gap-x-6 gap-y-3 items-center px-4 md:px-5 py-5 md:py-4`}>
        {/* T-minus */}
        <div className="row-span-2 md:row-span-1 self-start md:self-center">
          <span className="sr-only">T-minus: </span>
          <CountdownTimer targetDate={launch.net} variant="stacked" className="md:hidden" />
          <CountdownTimer targetDate={launch.net} className="hidden md:inline" />
        </div>

        {/* Mission */}
        <div className="min-w-0">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="text-left w-full"
          >
            <span className="flex items-baseline gap-2.5">
              {index && <span className="hidden md:inline font-mono text-[0.625rem] text-fg-faint tabular-nums">{index}</span>}
              <span className="font-display text-2xl md:text-xl leading-tight text-fg group-hover:text-fg line-clamp-2 md:line-clamp-1">
                {launch.name}
              </span>
            </span>
          </button>
          {/* Mobile meta line */}
          <p className="md:hidden mt-1.5 font-mono text-[0.6875rem] text-fg-muted truncate">
            {rocket} · {provider}
          </p>
        </div>

        {/* Vehicle / provider / pad (md+) */}
        <span className="hidden md:block font-mono text-[0.6875rem] text-fg-muted truncate">
          <span className="sr-only">Rocket: </span>
          {rocket}
        </span>
        <span className="hidden md:block font-mono text-[0.6875rem] text-fg-muted truncate">
          <span className="sr-only">Provider: </span>
          {provider}
        </span>
        <span className="hidden xl:block font-mono text-[0.6875rem] text-fg-muted truncate">
          <span className="sr-only">Pad: </span>
          {pad}
        </span>

        {/* Status + actions (mobile: one line under the mission) */}
        <div className="col-start-2 md:col-start-auto flex items-center gap-2 md:block">
          <LaunchStatusTag status={launch.status?.name} />
          {hasReminder && (
            <span className="md:hidden">
              <Badge variant="signal">{REMINDER_LABELS[reminderTime] || reminderTime}</Badge>
            </span>
          )}
        </div>

        <div className="col-start-2 md:col-start-auto flex items-center gap-1.5 md:justify-end">
          {reminderButton}
          <WatchToggle pressed={isInWatchlist} onClick={() => onToggleWatchlist(launch)} aria-label={isInWatchlist ? `Remove ${launch.name} from Watchlist` : `Add ${launch.name} to Watchlist`} />
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={expanded ? `Collapse ${launch.name}` : `Expand ${launch.name}`}
            className="h-9 w-9 flex items-center justify-center text-fg-muted hover:text-fg border border-transparent hover:border-line-strong transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Expanded brief */}
      <div id={panelId} hidden={!expanded}>
        {expanded && (
          <div className="grid grid-cols-12 gap-x-6 gap-y-6 px-4 md:px-5 pb-6 pt-1 animate-fade-in">
            <div className="col-span-12 md:col-span-4 relative overflow-hidden border border-line">
              <img
                src={launch.image || FALLBACK_IMAGE}
                alt={launch.name}
                loading="lazy"
                className="img-mono w-full aspect-[16/10] object-cover"
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              <span className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-ink/80 label text-fg-muted truncate">{provider}</span>
            </div>

            <div className="col-span-12 md:col-span-5 space-y-3">
              <span className="label text-fg-faint">Mission brief</span>
              <p className="text-sm text-fg-muted leading-relaxed">
                {launch.mission?.description || 'Payload deployment and space exploration mission.'}
              </p>
            </div>

            <div className="col-span-12 md:col-span-3 flex flex-col gap-5">
              <dl className="grid grid-cols-[4.5rem_1fr] gap-y-2 font-mono text-[0.6875rem]">
                <dt className="text-fg-faint uppercase tracking-label">NET</dt>
                <dd className="text-fg">{formattedDate}</dd>
                <dt className="text-fg-faint uppercase tracking-label">Orbit</dt>
                <dd className="text-fg">{launch.mission?.orbit?.name || 'Low Earth Orbit (LEO)'}</dd>
                <dt className="text-fg-faint uppercase tracking-label">Pad</dt>
                <dd className="text-fg">{pad}</dd>
                {hasReminder && (
                  <>
                    <dt className="text-fg-faint uppercase tracking-label">Alert</dt>
                    <dd className="text-signal">{REMINDER_LABELS[reminderTime] || reminderTime}</dd>
                  </>
                )}
              </dl>
              <div className="flex flex-wrap gap-2 mt-auto">
                <Button variant="secondary" size="sm" iconRight={ArrowUpRight} onClick={() => onSelectDetails(launch)}>
                  Full brief
                </Button>
                <Button variant="secondary" size="sm" icon={hasReminder ? BellRing : Bell} onClick={() => onOpenReminder && onOpenReminder(launch)}>
                  {hasReminder ? 'Reminder on' : 'Remind me'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export default LaunchCard;
