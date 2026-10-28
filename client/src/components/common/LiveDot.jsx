import React from 'react';

/** Muted green "online" dot with an optional mono label. `active=false` shows a static grey dot. */
const LiveDot = ({ label, active = true, className = '' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <span className="relative flex w-1.5 h-1.5" aria-hidden="true">
      {active && <span className="absolute inset-0 rounded-full bg-live animate-pulse-dot" />}
      <span className={`relative w-1.5 h-1.5 rounded-full ${active ? 'bg-live' : 'bg-fg-faint'}`} />
    </span>
    {label && <span className={`label ${active ? 'text-fg' : 'text-fg-muted'}`}>{label}</span>}
  </span>
);

export default LiveDot;
