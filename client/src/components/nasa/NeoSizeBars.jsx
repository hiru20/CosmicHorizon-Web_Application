import React from 'react';
import { avgDiameterKm } from './neoMath';

/** Thin horizontal bars comparing mean estimated diameter, with an Eiffel-tower reference line. */
const NeoSizeBars = ({ asteroids, selectedIds = [], limit = 10 }) => {
  const rows = asteroids.slice(0, limit);
  const maxDia = Math.max(...rows.map(avgDiameterKm), 0.33);
  const eiffel = 0.33; // km, height of the Eiffel Tower as a human-scale reference

  return (
    <div className="relative">
      <div
        className="absolute top-0 bottom-6 border-l border-dashed border-fg-faint pointer-events-none"
        style={{ left: `calc(9.75rem + (100% - 15rem) * ${eiffel / maxDia})` }}
        aria-hidden="true"
      >
        <span className="absolute -top-0.5 left-1.5 font-mono text-[0.5625rem] uppercase tracking-label text-fg-faint whitespace-nowrap">Eiffel 0.33</span>
      </div>
      <ul className="space-y-2.5 pt-5">
        {rows.map((ast) => {
          const d = avgDiameterKm(ast);
          const hazard = !!ast.is_potentially_hazardous_asteroid;
          const selected = selectedIds.includes(ast.id);
          return (
            <li key={ast.id} className="grid grid-cols-[9rem_1fr_4.5rem] items-center gap-3">
              <span className="font-mono text-[0.6875rem] text-fg-muted truncate" title={ast.name}>
                {ast.name}
              </span>
              <span className="relative h-2 bg-ink-700" aria-hidden="true">
                <span
                  className={`absolute inset-y-0 left-0 origin-left animate-draw-x ${selected ? 'bg-signal' : hazard ? 'bg-danger' : 'bg-fg-muted'}`}
                  style={{ width: `${Math.max(2, (d / maxDia) * 100)}%` }}
                />
              </span>
              <span className="telemetry text-[0.6875rem] text-fg text-right">{d.toFixed(2)} km</span>
            </li>
          );
        })}
      </ul>
      <p className="sr-only">Bar chart of mean estimated diameter for the first {rows.length} objects in the current view.</p>
    </div>
  );
};

export default NeoSizeBars;
