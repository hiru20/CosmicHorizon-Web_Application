import React, { useState, useEffect } from 'react';
import { spaceService } from '../../services/spaceService';
import Loader from '../common/Loader';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { Activity, Disc, Gauge, Navigation, GitCompare, Check, X } from 'lucide-react';

const NeoRadar = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Asteroid Comparison Tool State (up to 2 asteroids)
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    const fetchNeo = async () => {
      setLoading(true);
      try {
        const data = await spaceService.getNeoAsteroids();
        setAsteroids(data.asteroids || []);
      } catch (error) {
        console.error('NEO error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNeo();
  }, []);

  const toggleSelectAsteroid = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        // Replace the oldest selection with the new one
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const selectedAsteroids = selectedIds
    .map((id) => asteroids.find((a) => a.id === id))
    .filter(Boolean);

  // Helper to extract numeric metrics from an asteroid object
  const getMetrics = (ast) => {
    const approach = ast?.close_approach_data?.[0];
    const minDia = Number(ast?.estimated_diameter?.kilometers?.estimated_diameter_min || 0.1);
    const maxDia = Number(ast?.estimated_diameter?.kilometers?.estimated_diameter_max || 0.3);
    const avgDia = (minDia + maxDia) / 2;
    const velocity = Number(approach?.relative_velocity?.kilometers_per_hour || 0);
    const missDist = Number(approach?.miss_distance?.kilometers || 0);
    return {
      minDia,
      maxDia,
      avgDia,
      velocity,
      missDist,
      approachDate: approach?.close_approach_date || 'N/A',
      isHazard: !!ast?.is_potentially_hazardous_asteroid,
      magnitude: ast?.absolute_magnitude_h ?? 'N/A',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header + Comparison Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" />
            Near-Earth Asteroid Radar (NEO) &amp; Comparison Tool
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Select any two asteroids below and press <b className="text-cyan-300">Compare</b> to inspect their diameters, velocities, miss distances, and hazard levels side by side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-500/20">
            Tracking: {asteroids.length} Bodies
          </div>

          <button
            type="button"
            disabled={selectedAsteroids.length < 2}
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-glow-cyan disabled:opacity-40 transition"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare ({selectedAsteroids.length}/2)</span>
          </button>

          {selectedAsteroids.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Asteroids Banner */}
      {selectedAsteroids.length > 0 && (
        <div className="glass-panel px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-950/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Selected for comparison:</span>
            {selectedAsteroids.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono font-bold"
              >
                {a.name}
                <button
                  type="button"
                  onClick={() => toggleSelectAsteroid(a.id)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedAsteroids.length === 1 && (
              <span className="text-slate-400 italic">Select 1 more asteroid to compare...</span>
            )}
          </div>

          {selectedAsteroids.length === 2 && (
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
            >
              Compare Side by Side →
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800">
          <Loader message="Scanning planetary radar vectors and orbital approach trajectories..." />
        </div>
      ) : asteroids.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
          No asteroid approaches registered for this window.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {asteroids.map((ast) => {
            const isHazard = ast.is_potentially_hazardous_asteroid;
            const isSelected = selectedIds.includes(ast.id);
            const approach = ast.close_approach_data?.[0];
            const diameterMin = ast.estimated_diameter?.kilometers?.estimated_diameter_min?.toFixed(2) || '0.1';
            const diameterMax = ast.estimated_diameter?.kilometers?.estimated_diameter_max?.toFixed(2) || '0.3';
            const missDistKm = approach?.miss_distance?.kilometers
              ? Math.round(Number(approach.miss_distance.kilometers)).toLocaleString()
              : 'N/A';
            const velocityKmh = approach?.relative_velocity?.kilometers_per_hour
              ? Math.round(Number(approach.relative_velocity.kilometers_per_hour)).toLocaleString()
              : 'N/A';

            return (
              <div
                key={ast.id}
                className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 ring-1 ring-cyan-400/50 bg-cyan-950/15'
                    : isHazard
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 font-mono">
                        {ast.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        ID: {ast.id} • Mag {ast.absolute_magnitude_h} H
                      </span>
                    </div>

                    <Badge variant={isHazard ? 'danger' : 'go'}>
                      {isHazard ? 'Hazardous' : 'Nominal'}
                    </Badge>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Disc className="w-3.5 h-3.5 text-cyan-400" />
                        Est. Diameter
                      </span>
                      <span className="font-mono">{diameterMin} - {diameterMax} km</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        Miss Distance
                      </span>
                      <span className="font-mono">{missDistKm} km</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        Relative Velocity
                      </span>
                      <span className="font-mono">{velocityKmh} km/h</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Approach: <b className="text-slate-200">{approach?.close_approach_date || 'N/A'}</b>
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleSelectAsteroid(ast.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Asteroid Comparison Modal */}
      <Modal
        isOpen={isCompareOpen && selectedAsteroids.length === 2}
        onClose={() => setIsCompareOpen(false)}
        title="Side-by-Side Asteroid Comparison"
        maxWidth="max-w-3xl"
      >
        {selectedAsteroids.length === 2 && (() => {
          const [a1, a2] = selectedAsteroids;
          const m1 = getMetrics(a1);
          const m2 = getMetrics(a2);
          const maxDiaRef = Math.max(m1.maxDia, m2.maxDia, 0.1);
          const maxVelRef = Math.max(m1.velocity, m2.velocity, 1);
          const maxDistRef = Math.max(m1.missDist, m2.missDist, 1);

          return (
            <div className="space-y-6">
              {/* Top Headers */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { ast: a1, m: m1 },
                  { ast: a2, m: m2 },
                ].map(({ ast, m }) => (
                  <div
                    key={ast.id}
                    className={`p-4 rounded-2xl border ${
                      m.isHazard
                        ? 'border-rose-500/40 bg-rose-950/15'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-mono font-bold text-base text-white">{ast.name}</h4>
                        <p className="text-xs text-slate-400">NEO ID: {ast.id}</p>
                      </div>
                      <Badge variant={m.isHazard ? 'danger' : 'go'}>
                        {m.isHazard ? 'Hazardous' : 'Nominal'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="space-y-4 text-xs">
                {/* Diameter Comparison */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Estimated Diameter (km)
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono font-bold text-cyan-300 text-sm">
                        {m1.minDia.toFixed(2)} – {m1.maxDia.toFixed(2)} km
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.max(8, (m1.maxDia / maxDiaRef) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-indigo-300 text-sm">
                        {m2.minDia.toFixed(2)} – {m2.maxDia.toFixed(2)} km
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-indigo-400 rounded-full"
                          style={{ width: `${Math.max(8, (m2.maxDia / maxDiaRef) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Velocity Comparison */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Relative Velocity (km/h)
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono font-bold text-amber-300 text-sm">
                        {Math.round(m1.velocity).toLocaleString()} km/h
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${Math.max(8, (m1.velocity / maxVelRef) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-amber-300 text-sm">
                        {Math.round(m2.velocity).toLocaleString()} km/h
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${Math.max(8, (m2.velocity / maxVelRef) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Miss Distance Comparison */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Closest Miss Distance from Earth
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono font-bold text-emerald-300 text-sm">
                        {Math.round(m1.missDist).toLocaleString()} km
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ~{(m1.missDist / 384400).toFixed(1)}× Moon distance
                      </div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-emerald-300 text-sm">
                        {Math.round(m2.missDist).toLocaleString()} km
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ~{(m2.missDist / 384400).toFixed(1)}× Moon distance
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approach Date & Magnitude */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400 block">Approach Date &amp; Magnitude</span>
                    <span className="font-mono font-bold text-white">
                      {m1.approachDate} • Mag {m1.magnitude} H
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400 block">Approach Date &amp; Magnitude</span>
                    <span className="font-mono font-bold text-white">
                      {m2.approachDate} • Mag {m2.magnitude} H
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default NeoRadar;
