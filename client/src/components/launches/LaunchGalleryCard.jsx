import React from 'react';
import { Bell, BellRing, ArrowUpRight, Rocket, MapPin, CalendarClock } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import WatchToggle from './WatchToggle';
import { LaunchStatusTag, REMINDER_LABELS, FALLBACK_IMAGE } from './LaunchCard';
import Badge from '../common/Badge';

/**
 * Gallery view of one launch: mission imagery with a caption overlay, then the
 * countdown, vehicle / pad / NET details and the same actions as the manifest row.
 * Takes the same props as LaunchCard, so the page passes identical handlers.
 * `featured` makes the card span two columns with a taller image (used for the first card).
 */
const LaunchGalleryCard = ({
  launch,
  isInWatchlist,
  reminderTime,
  onToggleWatchlist,
  onOpenReminder,
  onSelectDetails,
  index,
  featured = false,
}) => {
  const hasReminder = reminderTime && reminderTime !== 'none';
  const provider = launch.launch_service_provider?.name || 'Space Provider';
  const rocket = launch.rocket?.configuration?.full_name || 'Rocket Launcher';
  const pad = launch.pad?.location?.name || 'Spaceport Pad';
  const formattedDate = launch.net
    ? new Date(launch.net).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBD';

  return (
    <li
      className={`group relative flex flex-col rounded-xl border border-line surface overflow-hidden transition-[border-color,transform] duration-300 ease-out hover:border-line-bright hover:-translate-y-1 focus-within:border-line-bright ${
        featured ? 'sm:col-span-2' : ''
      }`}
    >
      {/* Imagery */}
      <div className={`relative overflow-hidden bg-ink-800 ${featured ? 'aspect-[16/8]' : 'aspect-[16/10]'}`}>
        <img
          src={launch.image || FALLBACK_IMAGE}
          alt={launch.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" aria-hidden="true" />

        {/* Top strip: status + index */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <LaunchStatusTag status={launch.status?.name} />
            {hasReminder && <Badge variant="signal">{REMINDER_LABELS[reminderTime] || reminderTime}</Badge>}
          </div>
          {index && (
            <span className="font-mono text-[0.625rem] text-fg/80 tabular-nums bg-ink/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
              {index}
            </span>
          )}
        </div>

        {/* Caption overlay */}
        <div className="absolute left-4 right-4 bottom-3">
          <p className="label text-azure-300">{provider}</p>
          <h3 className={`mt-1 font-display leading-tight text-fg ${featured ? 'text-3xl sm:text-4xl line-clamp-2' : 'text-2xl line-clamp-2'}`}>
            {launch.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-4 p-4 sm:p-5">
        <div>
          <span className="sr-only">T-minus: </span>
          <CountdownTimer targetDate={launch.net} variant={featured ? 'large' : 'stacked'} />
        </div>

        {featured && launch.mission?.description && (
          <p className="text-sm text-fg-muted leading-relaxed line-clamp-2">{launch.mission.description}</p>
        )}

        <dl className="space-y-1.5 font-mono text-[0.6875rem] text-fg-muted">
          <div className="flex items-center gap-2 min-w-0">
            <dt>
              <Rocket className="w-3.5 h-3.5 text-azure-400" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Vehicle</span>
            </dt>
            <dd className="truncate">{rocket}</dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <dt>
              <MapPin className="w-3.5 h-3.5 text-azure-400" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Pad</span>
            </dt>
            <dd className="truncate">{pad}</dd>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <dt>
              <CalendarClock className="w-3.5 h-3.5 text-azure-400" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">Net launch time</span>
            </dt>
            <dd className="truncate">{formattedDate}</dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-line flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenReminder && onOpenReminder(launch)}
            aria-label={hasReminder ? `Reminder set (${REMINDER_LABELS[reminderTime] || reminderTime}). Change reminder for ${launch.name}` : `Set launch reminder for ${launch.name}`}
            title={hasReminder ? `Reminder set (${REMINDER_LABELS[reminderTime]})` : 'Set Launch Reminder'}
            className={`h-9 w-9 flex items-center justify-center rounded-btn border transition-colors ${
              hasReminder ? 'border-signal-line text-signal' : 'border-line-strong text-fg-muted hover:text-fg hover:border-fg-muted'
            }`}
          >
            {hasReminder ? <BellRing className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />}
          </button>
          <WatchToggle
            pressed={isInWatchlist}
            onClick={() => onToggleWatchlist(launch)}
            aria-label={isInWatchlist ? `Remove ${launch.name} from Watchlist` : `Add ${launch.name} to Watchlist`}
          />
          <button
            type="button"
            onClick={() => onSelectDetails(launch)}
            className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-btn text-[0.8125rem] font-semibold text-fg-muted hover:text-fg hover:bg-white/[0.05] transition-colors"
          >
            Details
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only"> for {launch.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
};

export default LaunchGalleryCard;
