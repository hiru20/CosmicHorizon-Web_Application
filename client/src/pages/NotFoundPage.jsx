import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

// Telemetry trace that runs as noise, then drops to a flat line where the signal is lost
const TRACE = (() => {
  let seed = 404;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const pts = [];
  for (let x = 0; x <= 560; x += 6) {
    const amp = x < 500 ? 34 * (1 - x / 560) : 0;
    pts.push(`${x},${(60 + (rand() - 0.5) * 2 * amp).toFixed(1)}`);
  }
  pts.push('1200,60');
  return `M${pts.join(' L')}`;
})();

const NotFoundPage = () => {
  const { pathname } = useLocation();
  const [stamp] = useState(() => new Date().toISOString().replace('T', ' ').slice(0, 19));

  return (
    <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 pt-14 sm:pt-20 pb-10">
      <div className="flex items-center gap-4 mb-10 font-mono text-label uppercase">
        <span className="text-signal">ERR</span>
        <span className="flex-1 h-px bg-line" aria-hidden="true" />
        <span className="text-fg-faint">Telemetry / downlink</span>
      </div>

      <div className="grid grid-cols-12 gap-x-6 gap-y-10 items-end">
        <h1 className="col-span-12 lg:col-span-9 font-display text-display-xl text-fg">
          Signal <span className="italic text-fg-muted">lost.</span>
        </h1>

        <dl className="col-span-12 sm:col-span-8 lg:col-span-3 border border-line font-mono text-xs divide-y divide-line">
          <div className="grid grid-cols-[5rem_1fr] px-4 py-2.5">
            <dt className="text-fg-faint uppercase tracking-label text-label">Code</dt>
            <dd className="text-signal">404</dd>
          </div>
          <div className="grid grid-cols-[5rem_1fr] px-4 py-2.5">
            <dt className="text-fg-faint uppercase tracking-label text-label">Path</dt>
            <dd className="text-fg break-all">{pathname}</dd>
          </div>
          <div className="grid grid-cols-[5rem_1fr] px-4 py-2.5">
            <dt className="text-fg-faint uppercase tracking-label text-label">T+</dt>
            <dd className="text-fg-muted">{stamp} UTC</dd>
          </div>
        </dl>
      </div>

      {/* Noise trace collapsing to a flatline */}
      <div className="relative my-14 border-y border-line overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 sm:h-32">
          <line x1="0" y1="60" x2="1200" y2="60" stroke="#1F1F1F" />
          <path d={TRACE} fill="none" stroke="#8A8A8A" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <rect x="500" y="56" width="6" height="8" fill="#FF5A1F" />
        </svg>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        <p className="col-span-12 md:col-span-6 lg:col-span-5 text-sm text-fg-muted leading-relaxed">
          No route in the flight registry answers to this path. The page may have moved, or the address was entered
          incorrectly.
        </p>
        <div className="col-span-12 md:col-span-6 lg:col-start-9 lg:col-span-4 md:justify-self-end">
          <Button to="/" size="lg" icon={ArrowLeft}>
            Return to index
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
