import React from 'react';
import { Link } from 'react-router-dom';
import LiveDot from '../common/LiveDot';

const MODULE_LINKS = [
  { index: '01', to: '/tracker', label: 'ISS orbital map' },
  { index: '02', to: '/nasa', label: 'NASA gallery' },
  { index: '03', to: '/launches', label: 'Launch manifest' },
  { index: '04', to: '/nasa#neo', label: 'Near-Earth objects' },
  { index: '05', to: '/dashboard', label: 'Mission log' },
];

const CREDITS = [
  { source: 'NASA Open APIs', use: 'APOD · Mars Rover Photos · NeoWs', href: 'https://api.nasa.gov/' },
  { source: 'Launch Library 2', use: 'The Space Devs launch manifest', href: 'https://thespacedevs.com/llapi' },
  { source: 'WhereTheISS.at', use: 'ISS state vector · NORAD 25544', href: 'https://wheretheiss.at/' },
  { source: 'NASA Visible Earth', use: 'Blue Marble · Black Marble textures', href: 'https://visibleearth.nasa.gov/' },
  { source: 'CARTO · OpenStreetMap · Esri', use: 'Map tiles', href: 'https://www.openstreetmap.org/copyright' },
];

/** Colophon-style footer: credits, coordinates, version. */
const Footer = () => {
  return (
    <footer className="relative mt-32 border-t border-line bg-ink/60 backdrop-blur-sm">
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10">
        {/* Oversized sign-off */}
        <div className="py-14 sm:py-20 border-b border-line grid grid-cols-12 gap-6 items-end">
          <p className="col-span-12 lg:col-span-8 font-display text-display-md text-fg">
            Recorded from low Earth orbit, <span className="italic text-fg-muted">every 3.5 seconds.</span>
          </p>
          <div className="col-span-12 lg:col-span-4 lg:text-right">
            <LiveDot label="Telemetry gateway nominal" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-6 gap-y-10 py-12">
          <nav aria-label="Modules" className="col-span-12 sm:col-span-6 lg:col-span-3">
            <h2 className="label text-fg-faint mb-5">Modules</h2>
            <ul className="space-y-2.5">
              {MODULE_LINKS.map((l) => (
                <li key={l.index}>
                  <Link to={l.to} className="group inline-flex items-baseline gap-3 text-sm text-fg-muted hover:text-fg transition-colors">
                    <span className="font-mono text-[0.625rem] text-fg-faint group-hover:text-signal">{l.index}</span>
                    <span className="link-sweep">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 sm:col-span-6 lg:col-span-5">
            <h2 className="label text-fg-faint mb-5">Data sources</h2>
            <dl className="divide-y divide-line border-y border-line">
              {CREDITS.map((c) => (
                <div key={c.source} className="grid grid-cols-[1fr_auto] sm:grid-cols-[11rem_1fr] gap-x-4 py-2.5">
                  <dt>
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="link-sweep text-sm text-fg">
                      {c.source}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </dt>
                  <dd className="font-mono text-[0.6875rem] text-fg-muted sm:self-center text-right sm:text-left">{c.use}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:pl-10 lg:border-l border-line">
            <h2 className="label text-fg-faint mb-5">Colophon</h2>
            <dl className="grid grid-cols-[6rem_1fr] gap-y-2 font-mono text-[0.6875rem]">
              <dt className="text-fg-faint uppercase tracking-label">Ground stn</dt>
              <dd className="text-fg-muted">51.5072° N, 0.1276° W</dd>
              <dt className="text-fg-faint uppercase tracking-label">Build</dt>
              <dd className="text-fg-muted">v2.0.0 — flight recorder</dd>
              <dt className="text-fg-faint uppercase tracking-label">Type</dt>
              <dd className="text-fg-muted">Instrument Serif, Inter, JetBrains Mono</dd>
            </dl>
          </div>
        </div>

        <div className="py-6 border-t border-line flex flex-col sm:flex-row justify-between gap-2 font-mono text-[0.625rem] uppercase tracking-label text-fg-faint">
          <p>© {new Date().getFullYear()} CosmicHorizon</p>
          <p>End of transmission</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
