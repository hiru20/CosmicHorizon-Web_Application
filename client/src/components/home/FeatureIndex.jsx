import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../common/Reveal';
import SectionHeader from '../common/SectionHeader';
import { formatTMinus } from './format';

// Title underline that sweeps in when the whole tile is hovered/focused
const SWEEP =
  'bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-left-bottom bg-[length:0%_1px] transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px]';

const Tile = ({ to, index, title, kicker, className = '', children }) => (
  <Link
    to={to}
    className={`group relative flex flex-col justify-between gap-10 bg-ink p-6 sm:p-8 outline-offset-[-1px] transition-colors duration-300 hover:bg-ink-900 ${className}`}
  >
    <div className="flex items-start justify-between gap-4">
      <span className="font-mono text-[0.6875rem] text-fg-faint group-hover:text-signal transition-colors">{index}</span>
      <ArrowUpRight
        className="w-4 h-4 text-fg-faint transition-[transform,color] duration-300 group-hover:text-fg group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </div>
    <div className="space-y-3 transition-transform duration-300 ease-out group-hover:translate-x-1">
      {kicker && <span className="label block">{kicker}</span>}
      <h3 className="font-display text-display-sm text-fg">
        <span className={`pb-1 ${SWEEP}`}>{title}</span>
      </h3>
      {children}
    </div>
  </Link>
);

/** Numbered editorial index of the four modules, laid out as an asymmetric ruled bento. */
const FeatureIndex = ({ telemetry, nextLaunch, tMinusMs, neoCount }) => (
  <section className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 pt-24 sm:pt-32">
    <SectionHeader
      as="h2"
      index="00"
      eyebrow="Index of modules"
      size="md"
      title={
        <>
          Four instruments, <span className="italic text-fg-muted">one console.</span>
        </>
      }
      description="Each module reads from a live source. Nothing here is a mock-up: positions, countdowns and counts update as the data does."
    />

    <Reveal className="mt-12 sm:mt-16">
      <div className="grid grid-cols-12 gap-px bg-line border border-line">
        {/* 01: large, two rows tall */}
        <Tile
          to="/tracker"
          index="01"
          kicker="Live · polled every 3.5 s"
          title="ISS tracker"
          className="col-span-12 lg:col-span-7 lg:row-span-2 min-h-[22rem] lg:min-h-[34rem]"
        >
          <p className="text-sm text-fg-muted max-w-sm leading-relaxed">
            Ground track, fading orbit trail and day/night terminator over a monochrome map, with a full telemetry column.
          </p>
          <dl className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-line">
            <div>
              <dt className="label">Velocity</dt>
              <dd className="mt-2 telemetry text-2xl text-signal">
                {telemetry?.velocity ? Math.round(telemetry.velocity).toLocaleString() : '27,600'}
                <span className="ml-1 text-[0.6875rem] text-fg-muted">KM/H</span>
              </dd>
            </div>
            <div>
              <dt className="label">Altitude</dt>
              <dd className="mt-2 telemetry text-2xl text-fg">
                {telemetry?.altitude ? Number(telemetry.altitude).toFixed(1) : '420.0'}
                <span className="ml-1 text-[0.6875rem] text-fg-muted">KM</span>
              </dd>
            </div>
            <div className="hidden sm:block">
              <dt className="label">Orbits / day</dt>
              <dd className="mt-2 telemetry text-2xl text-fg">15.5</dd>
            </div>
          </dl>
        </Tile>

        {/* 02: image tile */}
        <Link
          to="/nasa"
          className="group relative col-span-12 sm:col-span-6 lg:col-span-5 min-h-[18rem] overflow-hidden bg-ink outline-offset-[-1px]"
        >
          <img
            src="/textures/earth-night-lights.jpg"
            alt=""
            loading="lazy"
            className="img-mono absolute inset-0 w-full h-full object-cover object-[28%_40%] scale-[1.6] group-hover:scale-[1.66]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden="true" />
          <div className="relative h-full flex flex-col justify-between gap-10 p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[0.6875rem] text-fg-muted group-hover:text-signal transition-colors">02</span>
              <ArrowUpRight className="w-4 h-4 text-fg-muted group-hover:text-fg transition-colors" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="space-y-3 transition-transform duration-300 ease-out group-hover:translate-x-1">
              <span className="label block text-fg-muted">APOD archive · Mars rover frames</span>
              <h3 className="font-display text-display-sm text-fg">
                <span className={`pb-1 ${SWEEP}`}>NASA gallery</span>
              </h3>
            </div>
          </div>
        </Link>

        {/* 03: countdown */}
        <Tile to="/launches" index="03" kicker="Global manifest" title="Launches" className="col-span-12 sm:col-span-6 lg:col-span-5 min-h-[18rem]">
          {tMinusMs > 0 ? (
            <div className="space-y-1">
              <p className="telemetry text-xl sm:text-2xl text-signal">{formatTMinus(tMinusMs)}</p>
              <p className="font-mono text-[0.6875rem] text-fg-muted truncate">{nextLaunch?.name}</p>
            </div>
          ) : (
            <p className="text-sm text-fg-muted">Countdowns, providers, pads and a personal watchlist.</p>
          )}
        </Tile>

        {/* 04: full-width row, oversized number */}
        <Tile
          to="/nasa#neo"
          index="04"
          kicker="NeoWs · 7-day window"
          title="Near-Earth objects"
          className="col-span-12 min-h-[14rem]"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <p className="text-sm text-fg-muted max-w-md leading-relaxed">
              Miss distances, diameters and relative velocities, sorted and flagged where potentially hazardous.
            </p>
            {neoCount !== null && (
              <p className="telemetry text-6xl sm:text-7xl leading-none text-fg">
                {String(neoCount).padStart(3, '0')}
                <span className="ml-2 align-top label">objects</span>
              </p>
            )}
          </div>
        </Tile>
      </div>
    </Reveal>
  </section>
);

export default FeatureIndex;
