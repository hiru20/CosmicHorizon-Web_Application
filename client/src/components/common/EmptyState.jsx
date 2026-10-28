import React from 'react';

/** Quiet orbital line drawing used as the empty-state illustration */
const OrbitSketch = () => (
  <svg viewBox="0 0 160 160" className="w-28 h-28 text-line-bright" fill="none" aria-hidden="true">
    <circle cx="80" cy="80" r="22" stroke="currentColor" />
    <ellipse cx="80" cy="80" rx="64" ry="22" stroke="currentColor" strokeDasharray="2 4" transform="rotate(-18 80 80)" />
    <ellipse cx="80" cy="80" rx="74" ry="40" stroke="currentColor" opacity="0.5" transform="rotate(24 80 80)" />
    <circle cx="140" cy="62" r="2.5" className="fill-signal" stroke="none" />
    <path d="M80 4v10M80 146v10M4 80h10M146 80h10" stroke="currentColor" />
  </svg>
);

/** Typographic empty state: index code, serif line, quiet illustration and an optional action. */
const EmptyState = ({ code = 'NO SIGNAL', title, description, action, className = '' }) => (
  <div className={`rounded-xl border border-line surface px-6 py-14 sm:py-16 grid sm:grid-cols-[auto_1fr] gap-8 items-center ${className}`}>
    <div className="mx-auto sm:mx-0">
      <OrbitSketch />
    </div>
    <div className="space-y-4 text-center sm:text-left">
      <span className="label text-fg-faint">{code}</span>
      <h3 className="font-display text-display-sm text-fg">{title}</h3>
      {description && <p className="text-sm text-fg-muted max-w-md leading-relaxed mx-auto sm:mx-0">{description}</p>}
      {action && <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">{action}</div>}
    </div>
  </div>
);

export default EmptyState;
