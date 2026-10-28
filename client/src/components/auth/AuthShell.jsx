import React from 'react';
import { useReducedMotion } from 'framer-motion';
import UtcClock from '../common/UtcClock';

const ORBIT_PATH = 'M 40 200 A 260 92 -14 1 1 560 200 A 260 92 -14 1 1 40 200 Z';

/** Thin orbit ellipse with a single signal point travelling along it. Static under reduced motion. */
export const OrbitLoop = ({ className = '' }) => {
  const reduceMotion = useReducedMotion();
  return (
    <svg viewBox="0 0 600 400" className={className} fill="none" aria-hidden="true">
      <circle cx="300" cy="200" r="64" stroke="#2A2A2A" />
      <circle cx="300" cy="200" r="64" stroke="#3D3D3D" strokeDasharray="1 6" transform="rotate(-14 300 200)" />
      <path d={ORBIT_PATH} stroke="#3D3D3D" />
      <ellipse cx="300" cy="200" rx="290" ry="150" stroke="#1F1F1F" strokeDasharray="2 8" transform="rotate(10 300 200)" />
      <path d="M300 120v-14M300 280v14M220 200h-14M380 200h14" stroke="#555" />
      {/* Static point at the orbit's start under reduced motion; otherwise it travels the path */}
      <g transform={reduceMotion ? 'translate(40 200)' : undefined}>
        <rect x="-3" y="-3" width="6" height="6" fill="#FF5A1F" />
        <circle r="11" stroke="#FF5A1F" strokeOpacity="0.4" />
        {!reduceMotion && <animateMotion dur="22s" repeatCount="indefinite" path={ORBIT_PATH} />}
      </g>
    </svg>
  );
};

/**
 * Two-panel auth layout.
 * Left (lg: 7 cols): kicker lines, oversized serif statement, looping orbit visual, crosshairs, grid.
 * Right (lg: 5 cols): the form. On mobile the statement collapses to a compact two-line header.
 */
const AuthShell = ({ code, statement, mobileStatement, standfirst, children }) => (
  <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 pt-8 lg:pt-12">
    <div className="grid grid-cols-12 border border-line min-h-[calc(100vh-10rem)]">
      {/* Statement panel (desktop) */}
      <section className="hidden lg:flex col-span-7 relative flex-col justify-between overflow-hidden border-r border-line p-10 xl:p-14 bg-grid-lines bg-[length:64px_64px]">
        <span className="absolute top-3 left-3 w-2 h-2 border-l border-t border-fg-faint" aria-hidden="true" />
        <span className="absolute top-3 right-3 w-2 h-2 border-r border-t border-fg-faint" aria-hidden="true" />
        <span className="absolute bottom-3 left-3 w-2 h-2 border-l border-b border-fg-faint" aria-hidden="true" />
        <span className="absolute bottom-3 right-3 w-2 h-2 border-r border-b border-fg-faint" aria-hidden="true" />

        <div className="flex items-center justify-between gap-6 font-mono text-label uppercase text-fg-muted">
          <span>{code}</span>
          <UtcClock />
        </div>

        <OrbitLoop className="absolute -right-24 top-1/2 -translate-y-1/2 w-[46rem] max-w-none opacity-90 pointer-events-none" />

        <div className="relative space-y-8">
          <h1 className="font-display text-display-lg text-fg max-w-[11ch]">{statement}</h1>
          {standfirst && <p className="text-sm text-fg-muted leading-relaxed max-w-sm">{standfirst}</p>}
          <div className="flex items-center gap-6 font-mono text-label uppercase text-fg-faint">
            <span>Stn CH-25544</span>
            <span className="h-px w-10 bg-line-bright" aria-hidden="true" />
            <span>Secure channel / TLS</span>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="col-span-12 lg:col-span-5 flex flex-col bg-ink-900">
        {/* Compact statement (mobile / tablet) */}
        <div className="lg:hidden relative overflow-hidden border-b border-line px-5 sm:px-8 pt-8 pb-7">
          <div className="flex items-center justify-between font-mono text-label uppercase text-fg-faint mb-6">
            <span>{code}</span>
            <UtcClock />
          </div>
          <h1 className="relative font-display text-[2.75rem] sm:text-6xl leading-[0.95] tracking-tight text-fg max-w-[12ch]">
            {mobileStatement || statement}
          </h1>
          <OrbitLoop className="absolute -right-24 -top-6 w-80 opacity-50 pointer-events-none" />
        </div>

        <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 xl:px-12 py-10">{children}</div>
      </section>
    </div>
  </div>
);

/** Section index label: "01 / Credentials" */
export const StepLabel = ({ index, children }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="font-mono text-label text-signal">{index}</span>
    <span className="font-mono text-label text-fg-faint">/</span>
    <span className="label">{children}</span>
    <span className="flex-1 h-px bg-line" aria-hidden="true" />
  </div>
);

/** Thin danger-bordered message bar */
export const ErrorBar = ({ children, className = '' }) => (
  <div role="alert" className={`border border-danger/60 bg-black px-3 py-2.5 font-mono text-xs text-danger flex gap-3 ${className}`}>
    <span className="uppercase tracking-label flex-shrink-0">Err</span>
    <span className="border-l border-danger/30 pl-3 text-fg">{children}</span>
  </div>
);

/** Mono "Show"/"Hide" text toggle used in password Input rightSlot (UI state only) */
export const PasswordToggle = ({ shown, onToggle, controls }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={shown}
    aria-controls={controls}
    aria-label={shown ? 'Hide password' : 'Show password'}
    className="h-8 px-1 font-mono text-label uppercase text-fg-muted hover:text-fg transition-colors"
  >
    {shown ? 'Hide' : 'Show'}
  </button>
);

export default AuthShell;
