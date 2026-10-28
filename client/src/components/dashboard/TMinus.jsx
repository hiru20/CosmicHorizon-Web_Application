import React, { useEffect, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');

/** Display-only T-minus readout for a launch date. `size`: 'lg' (hero) | 'sm' (inline row). */
const TMinus = ({ targetDate, size = 'sm', className = '' }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetDate) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return <span className={`label text-fg-faint ${className}`}>Date TBD</span>;

  const diff = new Date(targetDate).getTime() - now;
  if (Number.isNaN(diff)) return <span className={`label text-fg-faint ${className}`}>Date TBD</span>;
  if (diff <= 0) return <span className={`label text-fg-muted ${className}`}>Window open / launched</span>;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  if (size === 'lg') {
    const units = [
      ['D', pad(d)],
      ['H', pad(h)],
      ['M', pad(m)],
      ['S', pad(s)],
    ];
    return (
      <div className={`flex items-end gap-3 sm:gap-5 ${className}`} role="timer" aria-label={`T minus ${d} days ${h} hours ${m} minutes`}>
        <span className="font-mono text-sm text-fg-muted pb-2">T−</span>
        {units.map(([u, v]) => (
          <div key={u} className="flex flex-col items-start">
            <span className="telemetry text-5xl sm:text-6xl leading-none text-signal">{v}</span>
            <span className="label text-fg-faint mt-2">{u}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className={`telemetry text-xs text-fg ${className}`}>
      <span className="text-fg-muted">T−</span>
      {pad(d)}:{pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
};

export default TMinus;
