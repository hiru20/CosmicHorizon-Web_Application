import React from 'react';
import Tag from '../common/Tag';
import TMinus from './TMinus';

const reminderLabels = {
  none: 'No reminder',
  '15m': 'Remind T−15m',
  '1h': 'Remind T−1h',
  '24h': 'Remind T−24h',
};

// Display-only mapping of launch status text to a tag style
const getStatusVariant = (statusName) => {
  const s = (statusName || '').toLowerCase();
  if (s.includes('go') || s.includes('success')) return 'go';
  if (s.includes('tbd') || s.includes('tbc')) return 'tbd';
  if (s.includes('hold') || s.includes('fail')) return 'hold';
  return 'default';
};

/** Ruled mission row for the watchlist board. Actions call handlers passed from DashboardPage. */
const MissionCard = ({ item, onEdit, onRemove }) => {
  const hasReminder = item.reminderTime && item.reminderTime !== 'none';
  const date = item.launchDate
    ? new Date(item.launchDate).toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : 'TBD';

  return (
    <article className="group p-4 sm:p-5 space-y-3 hover:bg-ink-900 transition-colors">
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag variant={getStatusVariant(item.status)}>{item.status || 'Scheduled'}</Tag>
        {hasReminder && <Tag variant="signal">{reminderLabels[item.reminderTime] || item.reminderTime}</Tag>}
      </div>

      <h3 className="font-display text-2xl leading-[1.05] text-fg">{item.launchName}</h3>

      <dl className="grid grid-cols-[4.5rem_1fr] gap-y-1 font-mono text-[0.6875rem]">
        <dt className="text-fg-faint uppercase tracking-label">Vehicle</dt>
        <dd className="text-fg-muted truncate">
          {item.rocket} / {item.agency}
        </dd>
        {item.padLocation && (
          <>
            <dt className="text-fg-faint uppercase tracking-label">Pad</dt>
            <dd className="text-fg-muted truncate">{item.padLocation}</dd>
          </>
        )}
        <dt className="text-fg-faint uppercase tracking-label">NET</dt>
        <dd className="text-fg-muted">{date}</dd>
        <dt className="text-fg-faint uppercase tracking-label">Count</dt>
        <dd>
          <TMinus targetDate={item.launchDate} />
        </dd>
      </dl>

      {item.notes && <p className="text-sm text-fg-muted leading-relaxed line-clamp-2 border-l border-line-bright pl-3">{item.notes}</p>}

      <div className="flex items-center gap-5 pt-1 font-mono text-[0.625rem] uppercase tracking-label">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="link-sweep text-fg-muted hover:text-signal"
          aria-label={`Edit priority, reminder and notes for ${item.launchName}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onRemove(item)}
          className="link-sweep text-fg-muted hover:text-danger"
          aria-label={`Remove ${item.launchName} from watchlist`}
        >
          Remove
        </button>
      </div>
    </article>
  );
};

export default MissionCard;
