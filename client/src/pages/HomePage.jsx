import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spaceService } from '../services/spaceService';
import { Orbit, Rocket, Telescope, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [quickTelemetry, setQuickTelemetry] = useState(null);

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

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-8 sm:pt-16">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-glow-cyan animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>ORBITAL GATEWAY ACTIVE</span>
          {quickTelemetry?.velocity && (
            <span className="text-slate-400">
              • ISS: {Math.round(quickTelemetry.velocity).toLocaleString()} km/h
            </span>
          )}
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
            Interactive Space Exploration &{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Satellite Tracking
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Monitor the International Space Station in real time, track global rocket launches with live countdowns, and explore NASA's deep space imagery.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/tracker"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-glow-cyan hover:scale-105 transition-all"
          >
            <Orbit className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Launch Live ISS Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/launches"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm glass-panel border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all"
          >
            <Rocket className="w-4 h-4 text-indigo-400" />
            <span>Upcoming Rocket Launches</span>
          </Link>
        </div>
      </section>

      {/* Feature Exploration Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            System Modules
          </h2>
          <p className="text-3xl font-extrabold text-white">
            Space Data Architecture at Your Fingertips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Module 1: ISS Tracker */}
          <Link
            to="/tracker"
            className="glass-panel p-8 rounded-3xl border border-slate-800 glass-panel-hover flex flex-col justify-between group space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-glow-cyan group-hover:scale-110 transition">
                <Orbit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                Live Satellite & ISS Telemetry
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stream real-time geographic coordinates, ground speed, orbital altitude, and Day/Night illumination of the International Space Station over an interactive Leaflet dark-map.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Tracker HUD</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Module 2: Upcoming Launches */}
          <Link
            to="/launches"
            className="glass-panel p-8 rounded-3xl border border-slate-800 glass-panel-hover flex flex-col justify-between group space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-glow-purple group-hover:scale-110 transition">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                Global Launch Manifest
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Filter missions by agency (SpaceX, NASA, Rocket Lab, ULA), monitor countdown timers down to the second, and save upcoming flights to your personal Watchlist.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>View Launch Schedules</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Module 3: NASA Observatory */}
          <Link
            to="/nasa"
            className="glass-panel p-8 rounded-3xl border border-slate-800 glass-panel-hover flex flex-col justify-between group space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-glow-purple group-hover:scale-110 transition">
                <Telescope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                NASA Deep Space Observatory
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Inspect Astronomy Picture of the Day (APOD) archives in high definition, filter Martian surface photos from Perseverance and Curiosity, and scan Near-Earth Asteroid trajectories.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Open NASA Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
