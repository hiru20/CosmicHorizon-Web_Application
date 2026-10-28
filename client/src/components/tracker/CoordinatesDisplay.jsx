import React from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';
import Badge from '../common/Badge';
import AnimatedNumber from '../common/AnimatedNumber';
import LiveDot from '../common/LiveDot';

// Stable formatters so AnimatedNumber only re-tweens when the value changes
const fmtAbs4 = (n) => Math.abs(n).toFixed(4);
const fmtInt = (n) => Math.round(n).toLocaleString();
const fmt1 = (n) => n.toFixed(1);

const Row = ({ label, unit, children, hint }) => (
  <div className="grid grid-cols-[5.5rem_1fr] items-baseline gap-3 py-3.5 border-b border-line">
    <dt className="label">{label}</dt>
    <dd className="min-w-0">
      <div className="telemetry text-xl text-fg leading-none">
        {children}
        {unit && <span className="ml-1.5 text-[0.6875rem] tracking-label text-fg-muted">{unit}</span>}
      </div>
      {hint && <div className="mt-1.5 font-mono text-[0.625rem] text-fg-muted">{hint}</div>}
    </dd>
  </div>
);

/** Right-hand mono telemetry column for the ISS tracker */
const CoordinatesDisplay = ({ telemetry, isPolling, onTogglePolling, onRefresh, lastUpdated }) => {
  if (!telemetry) return null;

  const velocity = telemetry.velocity ? telemetry.velocity : null;

  return (
    <section aria-label="ISS telemetry" className="border border-line bg-ink-900 crosshairs">
      <div className="flex items-center justify-between gap-4 px-5 h-10 border-b border-line">
        <span className="label text-fg-muted">T — State vector</span>
        <LiveDot label={isPolling ? 'Polling 3.5 s' : 'Paused'} active={isPolling} />
      </div>

      {/* Key number: ground speed */}
      <div className="px-5 pt-6 pb-5 border-b border-line">
        <span className="label">Velocity</span>
        <p className="mt-3 telemetry text-5xl leading-none text-signal">
          {velocity ? <AnimatedNumber value={velocity} format={fmtInt} /> : '27,600'}
          <span className="ml-2 text-xs tracking-label text-fg-muted">KM/H</span>
        </p>
        <p className="mt-2 font-mono text-[0.6875rem] text-fg-muted">
          Mach {(telemetry.velocity / 1234.8).toFixed(1)} · ~7.66 km/s
        </p>
      </div>

      <dl className="px-5">
        <Row label="LAT" unit={telemetry.latitude > 0 ? '° N' : '° S'}>
          <AnimatedNumber value={telemetry.latitude} format={fmtAbs4} />
        </Row>
        <Row label="LON" unit={telemetry.longitude > 0 ? '° E' : '° W'}>
          <AnimatedNumber value={telemetry.longitude} format={fmtAbs4} />
        </Row>
        <Row label="ALT" unit="KM" hint="Low Earth orbit">
          {telemetry.altitude ? <AnimatedNumber value={telemetry.altitude} format={fmt1} /> : '420.0'}
        </Row>
        <Row label="Footprint" unit="KM">
          ~{telemetry.footprint ? Math.round(telemetry.footprint).toLocaleString() : '4,500'}
        </Row>
        <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3 py-3.5 border-b border-line">
          <dt className="label">Lighting</dt>
          <dd>
            <Badge variant={telemetry.visibility === 'daylight' ? 'neutral' : 'dashed'}>{telemetry.visibility || 'Daylight'}</Badge>
          </dd>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] items-baseline gap-3 py-3.5">
          <dt className="label">Timestamp</dt>
          <dd className="font-mono text-xs text-fg tabular-nums">
            {lastUpdated ? (
              <>
                {lastUpdated.toLocaleTimeString()}
                <span className="block mt-1 text-[0.625rem] text-fg-muted">{lastUpdated.toISOString().replace('T', ' ').slice(0, 19)} UTC</span>
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-2 border-t border-line">
        <button
          type="button"
          onClick={onTogglePolling}
          aria-pressed={!isPolling}
          className="h-12 flex items-center justify-center gap-2 font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted hover:text-fg hover:bg-ink-800 transition-colors border-r border-line"
        >
          {isPolling ? <Pause className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> : <Play className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />}
          {isPolling ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          title="Fetch latest position"
          className="h-12 flex items-center justify-center gap-2 font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted hover:text-fg hover:bg-ink-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
          Refresh
        </button>
      </div>
    </section>
  );
};

export default CoordinatesDisplay;
