import React from 'react';

/**
 * Instrument readout: tiny mono label, large mono value, optional unit and footnote.
 * `accent` paints the value in signal orange (use for the one key number on a panel).
 * `size`: 'sm' | 'md' | 'lg' | 'xl'
 */
const SIZES = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-6xl sm:text-7xl',
};

const Stat = ({ label, value, unit, hint, accent = false, size = 'md', align = 'left', className = '', children }) => (
  <div className={`flex flex-col gap-2 ${align === 'right' ? 'items-end text-right' : ''} ${className}`}>
    <span className="label">{label}</span>
    <span className={`telemetry font-normal leading-none tracking-tight ${SIZES[size] || SIZES.md} ${accent ? 'text-signal' : 'text-fg'}`}>
      {value}
      {unit && <span className="ml-1.5 align-baseline text-[0.35em] tracking-label text-fg-muted uppercase">{unit}</span>}
    </span>
    {hint && <span className="font-mono text-[0.6875rem] text-fg-muted">{hint}</span>}
    {children}
  </div>
);

export default Stat;
