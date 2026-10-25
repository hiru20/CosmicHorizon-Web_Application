import React from 'react';
import { Link } from 'react-router-dom';
import { Orbit, Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="glass-panel p-10 max-w-md rounded-3xl border border-slate-800 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-glow-cyan">
          <Orbit className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black font-mono text-white">404</h1>
          <h2 className="text-lg font-bold text-slate-200">Lost in the Cosmos</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The orbital vector or coordinate path you are trying to reach does not exist in our flight registry.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Earth Base</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
