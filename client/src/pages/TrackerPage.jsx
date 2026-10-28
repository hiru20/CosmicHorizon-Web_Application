import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { spaceService } from '../services/spaceService';
import CoordinatesDisplay from '../components/tracker/CoordinatesDisplay';
import ISSMap from '../components/tracker/ISSMap';
import Loader from '../components/common/Loader';
import SectionHeader from '../components/common/SectionHeader';
import LiveDot from '../components/common/LiveDot';

const EarthGlobe = lazy(() => import('../components/three/EarthGlobe'));

const MISSION_BRIEF = [
  {
    value: '92.9',
    unit: 'MIN',
    title: 'Orbital period',
    body: 'The ISS orbits Earth every 92.9 minutes, completing roughly 16 orbits per day. Astronauts aboard witness 16 sunrises and sunsets every 24 hours.',
  },
  {
    value: '27,600',
    unit: 'KM/H',
    title: 'Ground speed',
    body: 'Travelling at over 27,600 km/h (~7.66 km/s), the station covers the distance from London to New York in under 12 minutes.',
  },
  {
    value: '420',
    unit: 'KM',
    title: 'Microgravity laboratory',
    body: 'Floating in low Earth orbit at approximately 420 km, the station runs human biology, astronomy and materials physics experiments.',
  },
];

const TrackerPage = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollingTimerRef = useRef(null);
  // UI-only: which view of the same telemetry is shown
  const [viewMode, setViewMode] = useState('2d');

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
    <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 space-y-12">
      <SectionHeader
        index="01"
        eyebrow="ISS · NORAD 25544"
        title={
          <>
            The station, <span className="italic text-fg-muted">live.</span>
          </>
        }
        description="Real-time ground track and state vector of the International Space Station, refreshed every 3.5 seconds."
        actions={
          <>
            <LiveDot label={isPolling ? 'Live' : 'Paused'} active={isPolling} className="mr-4" />
            <div className="inline-flex border border-line-strong" role="group" aria-label="Map view">
              {[
                { id: '2d', label: '2D map' },
                { id: '3d', label: '3D globe' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setViewMode(v.id)}
                  aria-pressed={viewMode === v.id}
                  className={`h-9 px-3.5 font-mono text-[0.6875rem] uppercase tracking-label transition-colors ${
                    viewMode === v.id ? 'bg-fg text-black' : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </>
        }
      />

      {loading && !telemetry ? (
        <div className="border border-line bg-ink-900">
          <Loader message="Contacting orbital telemetry nodes..." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Map / globe */}
            <div className="col-span-12 lg:col-span-8 min-w-0">
              {/* ISSMap stays mounted in 3D view so the Leaflet map and game state persist */}
              <div className={viewMode === '3d' ? 'hidden' : ''}>
                <ISSMap telemetry={telemetry} trajectory={trajectory} />
              </div>
              {viewMode === '3d' && (
                <div className="relative h-[420px] sm:h-[560px] border border-line bg-ink crosshairs">
                  <Suspense fallback={<Loader message="Loading globe..." />}>
                    <EarthGlobe
                      issPosition={telemetry}
                      trajectory={trajectory}
                      className="w-full h-full"
                      label="3D globe showing the live ISS position and recent ground track"
                    />
                  </Suspense>
                  <span className="absolute left-4 bottom-4 label text-fg-faint pointer-events-none">Drag to rotate</span>
                </div>
              )}
            </div>

            {/* Telemetry Metrics column */}
            <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-20">
              <CoordinatesDisplay
                telemetry={telemetry}
                isPolling={isPolling}
                onTogglePolling={() => setIsPolling(!isPolling)}
                onRefresh={fetchTelemetry}
                lastUpdated={lastUpdated}
              />
            </div>
          </div>

          {/* Mission brief: ruled list */}
          <section aria-labelledby="mission-brief" className="pt-8">
            <div className="flex items-center gap-4 mb-2">
              <h2 id="mission-brief" className="label text-fg-muted">
                Mission brief
              </h2>
              <span className="flex-1 h-px bg-line" aria-hidden="true" />
            </div>
            <ol className="divide-y divide-line border-b border-line">
              {MISSION_BRIEF.map((item, i) => (
                <li key={item.title} className="grid grid-cols-12 gap-x-6 gap-y-3 py-7 items-baseline">
                  <span className="col-span-2 sm:col-span-1 font-mono text-[0.6875rem] text-fg-faint">0{i + 1}</span>
                  <p className="col-span-10 sm:col-span-4 lg:col-span-3 telemetry text-4xl text-fg leading-none">
                    {item.value}
                    <span className="ml-1.5 text-[0.6875rem] tracking-label text-fg-muted">{item.unit}</span>
                  </p>
                  <h3 className="col-span-12 sm:col-span-7 lg:col-span-3 sm:col-start-6 lg:col-start-auto font-display text-2xl text-fg">{item.title}</h3>
                  <p className="col-span-12 lg:col-span-5 text-sm text-fg-muted leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
};

export default TrackerPage;
