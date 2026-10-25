import React from 'react';

const Loader = ({ message = 'Scanning deep space telemetry...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[220px]">
      <div className="relative w-16 h-16">
        {/* Orbital rings */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
        <div className="absolute inset-5 rounded-full bg-cyan-400/80 blur-[2px] animate-pulse"></div>
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-300 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
