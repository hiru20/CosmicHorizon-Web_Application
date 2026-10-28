import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { spaceService } from '../services/spaceService';
import { ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import Ticker from '../components/common/Ticker';
import FeatureIndex from '../components/home/FeatureIndex';
import { formatTMinus, formatLat, formatLng } from '../components/home/format';

const EarthGlobe = lazy(() => import('../components/three/EarthGlobe'));

const HEADLINE = [
  { text: 'Every orbit', className: 'text-fg' },
  { text: 'on the record.', className: 'italic text-fg-muted' },
];

const GlobePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
    <div className="w-[70%] aspect-square rounded-full border border-line-strong" />
  </div>
);

const HomePage = () => {
  const [quickTelemetry, setQuickTelemetry] = useState(null);
  // Display-only extras for the live ticker (existing endpoints, fail silently)
  const [nextLaunch, setNextLaunch] = useState(null);
  const [neoCount, setNeoCount] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const fetchQuickData = async () => {
      try {
        const iss = await spaceService.getIssTelemetry();
        setQuickTelemetry(iss);
      } catch (e) {
        console.warn('Telemetry quick preview unavailable');
      }
    };
    fetchQuickData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    spaceService
      .getUpcomingLaunches()
      .then((data) => {
        const upcoming = (data?.launches || [])
          .filter((l) => l.net && new Date(l.net).getTime() > Date.now())
          .sort((a, b) => new Date(a.net) - new Date(b.net));
        if (!cancelled && upcoming[0]) setNextLaunch(upcoming[0]);
      })
      .catch(() => {});
    spaceService
      .getNeoAsteroids()
      .then((data) => {
        if (!cancelled && Array.isArray(data?.asteroids)) setNeoCount(data.asteroids.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // One-second tick for the T-minus readout
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tMinusMs = nextLaunch ? new Date(nextLaunch.net).getTime() - now : null;
  const hasIss = quickTelemetry && typeof quickTelemetry.latitude === 'number';

  const tickerItems = [
    hasIss && { label: 'ISS LAT', value: formatLat(quickTelemetry.latitude) },
    hasIss && { label: 'ISS LON', value: formatLng(quickTelemetry.longitude) },
    quickTelemetry?.velocity && { label: 'VEL', value: `${Math.round(quickTelemetry.velocity).toLocaleString()} KM/H` },
    quickTelemetry?.altitude && { label: 'ALT', value: `${Number(quickTelemetry.altitude).toFixed(1)} KM` },
    tMinusMs > 0 && { label: 'NEXT LAUNCH', value: formatTMinus(tMinusMs), accent: true },
    nextLaunch && { label: 'MISSION', value: nextLaunch.name },
    neoCount !== null && { label: 'NEO TRACKED · 7D', value: String(neoCount).padStart(3, '0') },
    { label: 'NORAD', value: '25544' },
  ].filter(Boolean);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Structural grid backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:calc(100%/12)_100%] opacity-60" aria-hidden="true" />

        <div className="relative max-w-shell mx-auto px-4 sm:px-6 lg:px-10 lg:min-h-[calc(100svh-3.5rem-2.75rem)] grid grid-cols-12 gap-x-6">
          {/* Copy column */}
          <div className="relative z-10 col-span-12 lg:col-span-8 xl:col-span-7 flex flex-col justify-between pt-10 sm:pt-16 lg:pt-20 pb-10 lg:pb-16">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted">
              <span className="text-signal">Log 25544</span>
              <span>LEO · ~408 km</span>
              <span>Incl. 51.64°</span>
              <span className="hidden sm:inline">Period 92.9 min</span>
            </div>

            <h1 className="mt-10 sm:mt-14 font-display font-normal text-display-xl">
              {HEADLINE.map((line, i) => (
                <span key={line.text} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className={`block ${line.className} ${i === 1 ? 'lg:pl-[12%]' : ''}`}
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.div
              className="mt-10 lg:mt-14 grid sm:grid-cols-[minmax(0,26rem)_auto] gap-8 sm:items-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              <p className="text-[0.95rem] leading-relaxed text-fg-muted">
                CosmicHorizon logs the International Space Station&apos;s position every 3.5 seconds, beside the global
                launch manifest, NASA&apos;s image archive and every near-Earth object on approach this week.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Button to="/tracker" size="lg" iconRight={ArrowRight}>
                  Open live tracker
                </Button>
                <Button to="/launches" variant="link">
                  Launch manifest
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Globe: offset right and cropped by the viewport edge */}
          <div
            className="relative col-span-12 h-[92vw] -mx-4 sm:mx-0 sm:h-[70vw] lg:absolute lg:h-auto lg:right-[-16vw] lg:top-1/2 lg:-translate-y-1/2 lg:w-[62vw] lg:aspect-square xl:right-[-12vw] xl:w-[56vw]"
          >
            <div className="absolute inset-0 translate-x-[22%] lg:translate-x-0">
              <Suspense fallback={<GlobePlaceholder />}>
                <EarthGlobe className="w-full h-full" />
              </Suspense>
            </div>

            {/* Live coordinate callout */}
            {hasIss && (
              <div className="absolute left-4 sm:left-0 bottom-6 lg:left-[6%] lg:bottom-[18%] pointer-events-none">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-px bg-signal" aria-hidden="true" />
                  <span className="label text-signal">ISS · now</span>
                </div>
                <dl className="mt-2 ml-[3.25rem] grid grid-cols-[2.5rem_auto] gap-y-0.5 font-mono text-[0.6875rem]">
                  <dt className="text-fg-faint">LAT</dt>
                  <dd className="text-fg tabular-nums">{formatLat(quickTelemetry.latitude)}</dd>
                  <dt className="text-fg-faint">LON</dt>
                  <dd className="text-fg tabular-nums">{formatLng(quickTelemetry.longitude)}</dd>
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Bottom rule draws in */}
        <span className="absolute left-0 bottom-0 h-px w-full bg-line-bright origin-left animate-draw-x" aria-hidden="true" />
      </section>

      {/* ── Live ticker ── */}
      <Ticker items={tickerItems} />

      {/* ── Feature index ── */}
      <FeatureIndex telemetry={quickTelemetry} nextLaunch={nextLaunch} tMinusMs={tMinusMs} neoCount={neoCount} />
    </div>
  );
};

export default HomePage;
