import React, { useState, useEffect } from 'react';
import { spaceService } from '../../services/spaceService';
import Loader from '../common/Loader';
import Badge from '../common/Badge';
import { ShieldAlert, Activity, Disc, Gauge, Navigation } from 'lucide-react';

const NeoRadar = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" />
            Near-Earth Asteroid Radar (NEO)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tracking celestial bodies and small Solar System objects whose orbits bring them into Earth's vicinity.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-500/20">
          Tracking: {asteroids.length} Bodies
        </div>
      </div>

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
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isHazard
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
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

                {approach?.close_approach_date && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    Closest approach: <b className="text-slate-200">{approach.close_approach_date}</b>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NeoRadar;
