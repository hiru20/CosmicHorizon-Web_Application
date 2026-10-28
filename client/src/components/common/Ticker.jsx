import React from 'react';

/**
 * Horizontal live-data strip. `items`: [{ label, value, accent? }].
 * Scrolls as a marquee (paused on hover/focus); static and scrollable under reduced motion.
 */
const Ticker = ({ items = [], className = '', ariaLabel = 'Live telemetry' }) => {
  const visible = items.filter((i) => i && i.value !== undefined && i.value !== null && i.value !== '');
  if (!visible.length) return null;

  const row = (hidden) => (
    <ul className={`flex items-center flex-shrink-0 ${hidden ? 'motion-reduce:hidden' : ''}`} aria-hidden={hidden || undefined}>
      {visible.map((item, i) => (
        <li key={`${item.label}-${i}`} className="flex items-center gap-3 px-6 sm:px-8 h-11 border-r border-line whitespace-nowrap">
          <span className="label text-fg-faint">{item.label}</span>
          <span className={`telemetry text-xs ${item.accent ? 'text-signal' : 'text-fg'}`}>{item.value}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label={ariaLabel} className={`group relative border-y border-line bg-ink/70 backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:w-full motion-reduce:overflow-x-auto">
        {row(false)}
        {row(true)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent" aria-hidden="true" />
    </section>
  );
};

export default Ticker;
