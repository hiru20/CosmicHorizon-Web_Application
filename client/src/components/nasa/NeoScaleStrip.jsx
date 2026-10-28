import React from 'react';
import { missLd, missKm, logDomain, formatLd } from './neoMath';

/**
 * Distance-from-Earth scale strip (log scale, lunar distances).
 * Each asteroid is a focusable tick; hazardous objects are drawn as danger outlines.
 */
const NeoScaleStrip = ({ asteroids, selectedIds = [], onToggle }) => {
  const { scale, ticks } = logDomain(asteroids.map(missLd));
  const pct = (v) => `${(scale(v) * 100).toFixed(3)}%`;

  return (
    <div>
      <div className="relative h-40 sm:h-44 select-none">
        {/* Earth origin */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-end">
          <span className="label text-fg-faint -translate-y-1">Earth</span>
        </div>

        {/* Axis */}
        <div className="absolute left-0 right-0 bottom-8 h-px bg-line-bright" aria-hidden="true" />

        {/* Decade ticks */}
        {ticks.map((t) => (
          <div key={t} className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center" style={{ left: pct(t) }} aria-hidden="true">
            <span className="w-px h-2.5 bg-line-bright mb-1.5" />
            <span className="font-mono text-[0.625rem] text-fg-faint tabular-nums">{formatLd(t)}</span>
          </div>
        ))}

        {/* Moon reference */}
        <div className="absolute top-0 bottom-8 -translate-x-1/2 flex flex-col items-center" style={{ left: pct(1) }} aria-hidden="true">
          <span className="label text-fg-muted whitespace-nowrap">Moon · 1 LD</span>
          <span className="flex-1 w-px border-l border-dashed border-fg-faint mt-1" />
        </div>

        {/* Objects */}
        {asteroids.map((ast, i) => {
          const ld = missLd(ast);
          const hazard = !!ast.is_potentially_hazardous_asteroid;
          const selected = selectedIds.includes(ast.id);
          const lift = 20 + (i % 4) * 22;
          return (
            <div
              key={ast.id}
              className="group absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: pct(ld), bottom: '2rem', height: `${lift + 8}px` }}
            >
              <button
                type="button"
                onClick={() => onToggle && onToggle(ast.id)}
                aria-pressed={selected}
                className={`relative w-2.5 h-2.5 border focus-visible:outline-offset-2 ${
                  selected
                    ? 'bg-signal border-signal'
                    : hazard
                    ? 'bg-ink border-danger'
                    : 'bg-fg-muted border-fg-muted'
                }`}
                aria-label={`${ast.name}: ${formatLd(ld)} lunar distances, ${Math.round(missKm(ast)).toLocaleString()} km${hazard ? ', potentially hazardous' : ''}`}
              />
              <span className={`flex-1 w-px ${hazard ? 'bg-danger/50' : 'bg-line-bright'}`} aria-hidden="true" />
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap border border-line-strong bg-ink-800 px-2 py-1 font-mono text-[0.625rem] text-fg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10"
              >
                {ast.name} · {formatLd(ld)} LD
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.625rem] uppercase tracking-label text-fg-muted">
        <span>Miss distance · lunar distances (log)</span>
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 bg-fg-muted" aria-hidden="true" /> Nominal
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 border border-danger" aria-hidden="true" /> Potentially hazardous
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 bg-signal" aria-hidden="true" /> Selected
        </span>
      </div>
    </div>
  );
};

export default NeoScaleStrip;
