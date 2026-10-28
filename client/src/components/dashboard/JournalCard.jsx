import React from 'react';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : '—');

const ACTION = 'h-8 px-2.5 flex items-center bg-black/85 border border-line-strong font-mono text-[0.625rem] uppercase tracking-label transition-colors';

/**
 * Space Journal (favorite) tile. `featured` makes it the large lead image of the grid.
 * Actions show on hover / keyboard focus on pointer devices and are always visible on touch.
 * They call the handlers passed from DashboardPage.
 */
const JournalCard = ({ fav, onView, onEdit, onDelete, featured = false }) => (
  <article
    className={`group relative flex flex-col border border-line bg-ink-900 hover:border-line-bright focus-within:border-line-bright transition-colors duration-300 ${
      featured ? 'sm:col-span-2 lg:row-span-2' : ''
    }`}
  >
    {/* Image / typographic placeholder */}
    <button
      type="button"
      onClick={() => onView(fav)}
      className={`relative w-full overflow-hidden bg-black block text-left ${featured ? 'aspect-[16/10] lg:flex-1 lg:aspect-auto lg:min-h-[22rem]' : 'aspect-[4/3]'}`}
      aria-label={`View details for ${fav.title}`}
    >
      {fav.imageUrl ? (
        <img src={fav.imageUrl} alt="" loading="lazy" className="img-mono absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02]" />
      ) : (
        <span className="absolute inset-0 crosshairs m-4 flex items-end p-4 border border-line">
          <span className="font-display text-5xl text-fg-faint uppercase leading-none">{fav.itemType}</span>
        </span>
      )}
    </button>

    {/* Hover / focus actions */}
    <div className="absolute top-3 right-3 flex gap-px [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
      <button type="button" onClick={() => onView(fav)} className={`${ACTION} text-fg-muted hover:text-fg`} aria-label={`View ${fav.title}`}>
        View
      </button>
      <button type="button" onClick={() => onEdit(fav)} className={`${ACTION} text-fg-muted hover:text-signal`} aria-label={`Edit ${fav.title}`}>
        Edit
      </button>
      <button type="button" onClick={() => onDelete(fav)} className={`${ACTION} text-fg-muted hover:text-danger`} aria-label={`Delete ${fav.title}`}>
        Delete
      </button>
    </div>

    {/* Caption */}
    <div className="p-4 sm:p-5 border-t border-line space-y-2">
      <div className="flex items-center justify-between gap-3 label">
        <span className="text-signal">{fav.itemType}</span>
        <time className="text-fg-faint" dateTime={fav.createdAt}>
          {formatDate(fav.createdAt)}
        </time>
      </div>
      <h3 className={`font-display leading-[1.05] text-fg ${featured ? 'text-4xl' : 'text-2xl line-clamp-2'}`}>{fav.title}</h3>
      {fav.description && (
        <p className={`text-sm text-fg-muted leading-relaxed ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>{fav.description}</p>
      )}
      {fav.notes && (
        <p className="font-mono text-[0.6875rem] text-fg-muted line-clamp-2 pt-1">
          <span className="text-fg-faint">NOTE — </span>
          {fav.notes}
        </p>
      )}
    </div>
  </article>
);

export default JournalCard;
