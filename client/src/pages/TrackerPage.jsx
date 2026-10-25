import React, { useState, useEffect, useRef, useCallback } from 'react';
import { spaceService } from '../services/spaceService';
import CoordinatesDisplay from '../components/tracker/CoordinatesDisplay';
import ISSMap from '../components/tracker/ISSMap';
import Loader from '../components/common/Loader';
import { Orbit, Info, Globe, Clock, Zap } from 'lucide-react';

const TrackerPage = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollingTimerRef = useRef(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      const data = await spaceService.getIssTelemetry();
      setTelemetry(data);
      setLastUpdated(new Date());

      // Append to trajectory history if valid
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        setTrajectory((prev) => {
          const newPoint = [data.latitude, data.longitude];
          const updated = [...prev, newPoint];
          return updated.slice(-40); // keep last 40 coordinates
        });
      }
    } catch (error) {
      console.error('Failed to update ISS telemetry:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Polling Interval
  useEffect(() => {
    if (isPolling) {
      pollingTimerRef.current = setInterval(() => {
        fetchTelemetry();
      }, 3500); // Poll every 3.5 seconds
    } else {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    }

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [isPolling, fetchTelemetry]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Orbit className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Satellite & ISS Tracking
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Real-time telemetry and orbital path of the International Space Station (NORAD ID: 25544)
          </p>
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {loading && !telemetry ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800">
          <Loader message="Contacting orbital telemetry nodes..." />
        </div>
      ) : (
        <>
          {/* Telemetry Metrics HUD */}
          <CoordinatesDisplay
            telemetry={telemetry}
            isPolling={isPolling}
            onTogglePolling={() => setIsPolling(!isPolling)}
            onRefresh={fetchTelemetry}
            lastUpdated={lastUpdated}
          />

          {/* Leaflet Map */}
          <ISSMap telemetry={telemetry} trajectory={trajectory} />

          {/* Educational Insights / Mission Brief */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm mb-2">
                <Globe className="w-4 h-4" />
                <span>Orbital Period</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The ISS orbits Earth every <b>92.9 minutes</b>, completing roughly <b>16 orbits per day</b>. Astronauts aboard witness 16 sunrises and sunsets every 24 hours.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-3 text-sky-400 font-semibold text-sm mb-2">
                <Zap className="w-4 h-4" />
                <span>Extreme Velocity</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Traveling at over <b>27,600 km/h (~7.66 km/s)</b>, the station covers the distance from London to New York in under 12 minutes.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-3 text-indigo-400 font-semibold text-sm mb-2">
                <Info className="w-4 h-4" />
                <span>Microgravity Laboratory</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Floating in Low Earth Orbit at approximately <b>420 km</b>, the station conducts pioneering human biology, astronomy, and material physics experiments.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrackerPage;
