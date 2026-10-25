import React from 'react';
import { Gauge, ArrowUpRight, Compass, Eye, ShieldAlert, Radio } from 'lucide-react';
import Badge from '../common/Badge';

const CoordinatesDisplay = ({ telemetry, isPolling, onTogglePolling, onRefresh, lastUpdated }) => {
  if (!telemetry) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Latitude & Longitude */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            Coordinates
          </span>
          <span className="font-mono text-[10px] text-slate-500">WGS84</span>
        </div>
        <div className="text-xl font-bold font-mono text-slate-100 tracking-tight">
          {telemetry.latitude > 0 ? `${telemetry.latitude}° N` : `${Math.abs(telemetry.latitude)}° S`}
        </div>
        <div className="text-sm font-mono text-cyan-400 mt-0.5">
          {telemetry.longitude > 0 ? `${telemetry.longitude}° E` : `${Math.abs(telemetry.longitude)}° W`}
        </div>
      </div>

      {/* Orbital Velocity */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-sky-400" />
            Orbital Velocity
          </span>
          <span className="text-[10px] text-slate-500">~7.66 km/s</span>
        </div>
        <div className="text-xl font-bold font-mono text-slate-100 tracking-tight">
          {telemetry.velocity ? Math.round(telemetry.velocity).toLocaleString() : '27,600'}{' '}
          <span className="text-xs font-normal text-slate-400">km/h</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Mach {(telemetry.velocity / 1234.8).toFixed(1)} (22x sound speed)
        </div>
      </div>

      {/* Orbital Altitude */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            Altitude
          </span>
          <span className="text-[10px] text-slate-500">LEO</span>
        </div>
        <div className="text-xl font-bold font-mono text-slate-100 tracking-tight">
          {telemetry.altitude ? telemetry.altitude.toFixed(1) : '420.0'}{' '}
          <span className="text-xs font-normal text-slate-400">km</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Ground Footprint: ~{telemetry.footprint ? Math.round(telemetry.footprint) : '4,500'} km
        </div>
      </div>

      {/* Visibility & Status */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" />
            Orbital Lighting
          </span>
          <Badge variant={telemetry.visibility === 'daylight' ? 'go' : 'purple'}>
            {telemetry.visibility || 'Daylight'}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isPolling ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px]">
              {isPolling ? 'Auto Polling (3s)' : 'Paused'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePolling}
              className="px-2 py-1 text-xs rounded border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white transition"
            >
              {isPolling ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={onRefresh}
              className="px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
              title="Fetch latest position"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatesDisplay;
