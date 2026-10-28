import React from 'react';
import { Orbit, Heart, Globe2, Radio } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-space-darkest/90 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold tracking-wider text-slate-100">
                COSMICHORIZON
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Interactive space exploration and orbital telemetry platform providing real-time satellite tracking, global launch schedules, and deep-space observatory archives.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Radio className="w-3.5 h-3.5" />
              <span>Telemetry Gateway: Online & Polling</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Exploration Modules
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="/tracker" className="hover:text-cyan-400 transition">
                  Live ISS Orbital Map
                </a>
              </li>
              <li>
                <a href="/launches" className="hover:text-cyan-400 transition">
                  Global Rocket Launches
                </a>
              </li>
              <li>
                <a href="/nasa" className="hover:text-cyan-400 transition">
                  NASA APOD & Mars Rovers
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-cyan-400 transition">
                  Mission Watchlist & Bookmarks
                </a>
              </li>
            </ul>
          </div>

          {/* Academic & Data Credits */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              API & Science Data
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>NASA Open APIs (APOD, Mars, NEO)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Launch Library 2 (The Space Devs)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>WhereTheISS.at / NORAD #25544</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CosmicHorizon. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Powered by NASA Open Data, Launch Library 2 &amp; Orbital Telemetry Networks
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
