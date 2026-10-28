import React from 'react';
import { missLd, logDomain, formatLd } from './neoMath';

/**
 * Proximity diagram: Earth at the centre, rings at each decade of lunar distance (log),
 * objects placed by miss distance at evenly spread bearings. Bearings are illustrative only.
 */
const NeoOrbitDiagram = ({ asteroids, selectedIds = [] }) => {
  const { scale, ticks } = logDomain(asteroids.map(missLd));
  const C = 120;
  const R0 = 14;
  const R1 = 108;
  const radius = (ld) => R0 + scale(ld) * (R1 - R0);

  return (
    <figure>
      <svg viewBox="0 0 240 240" className="w-full max-w-[22rem] mx-auto block" role="img" aria-label={`Proximity diagram of ${asteroids.length} near-Earth objects by miss distance`}>
        {/* Decade rings */}
        {ticks.map((t) => (
          <g key={t}>
            <circle cx={C} cy={C} r={radius(t)} fill="none" stroke="#2A2A2A" strokeWidth="0.6" />
            <text x={C + radius(t) + 2} y={C - 2} fill="#555" fontSize="5.5" fontFamily="JetBrains Mono, monospace">
              {formatLd(t)}
            </text>
          </g>
        ))}
        {/* Moon ring */}
        <circle cx={C} cy={C} r={radius(1)} fill="none" stroke="#8A8A8A" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
        <text x={C} y={C - radius(1) - 3} textAnchor="middle" fill="#8A8A8A" fontSize="5.5" fontFamily="JetBrains Mono, monospace">
          MOON
        </text>
        {/* Crosshair */}
        <path d={`M${C} 4V22M${C} 218V236M4 ${C}H22M218 ${C}H236`} stroke="#3D3D3D" strokeWidth="0.6" />
        {/* Earth */}
        <circle cx={C} cy={C} r="5" fill="#EDEDED" />
        {/* Objects */}
        {asteroids.map((ast, i) => {
          const a = (i / Math.max(asteroids.length, 1)) * Math.PI * 2 - Math.PI / 2;
          const r = radius(missLd(ast));
          const x = C + Math.cos(a) * r;
          const y = C + Math.sin(a) * r;
          const hazard = !!ast.is_potentially_hazardous_asteroid;
          const selected = selectedIds.includes(ast.id);
          return (
            <g key={ast.id}>
              <line x1={C} y1={C} x2={x} y2={y} stroke={selected ? '#FF5A1F' : '#1F1F1F'} strokeWidth="0.5" />
              <rect
                x={x - 2}
                y={y - 2}
                width="4"
                height="4"
                fill={selected ? '#FF5A1F' : hazard ? '#000' : '#8A8A8A'}
                stroke={selected ? '#FF5A1F' : hazard ? '#E5484D' : '#8A8A8A'}
                strokeWidth="0.8"
              >
                <title>{`${ast.name} — ${formatLd(missLd(ast))} LD`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 text-center font-mono text-[0.625rem] uppercase tracking-label text-fg-faint">
        Radius: miss distance (log LD) · Bearing: illustrative
      </figcaption>
    </figure>
  );
};

export default NeoOrbitDiagram;
