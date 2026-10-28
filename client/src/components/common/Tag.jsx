import React from 'react';

// Outlined mono tags. Colour is reserved: signal = active/attention, live = go/online, danger = hold/hazard.
const VARIANTS = {
  neutral: 'border-line-bright text-fg-muted',
  signal: 'border-signal-line text-signal',
  live: 'border-live/50 text-live',
  danger: 'border-danger/55 text-danger',
  dashed: 'border-dashed border-line-bright text-fg-muted',
};

// Status vocabulary used across the app, mapped onto the restrained set
const ALIASES = {
  default: 'neutral',
  success: 'live',
  go: 'live',
  warning: 'dashed',
  tbd: 'dashed',
  danger: 'danger',
  hazard: 'danger',
  hold: 'danger',
  info: 'signal',
  live: 'live',
  purple: 'neutral',
};

const Tag = ({ variant = 'neutral', children, className = '', dot = false }) => {
  const key = VARIANTS[variant] ? variant : ALIASES[variant] || 'neutral';
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[22px] px-2 border bg-ink/60 font-mono text-[0.625rem] font-medium uppercase tracking-label leading-none whitespace-nowrap ${VARIANTS[key]} ${className}`}
    >
      {dot && <span className="w-1 h-1 bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Tag;
