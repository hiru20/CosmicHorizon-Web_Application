import React from 'react';

/** "Acquiring signal" loading state: a sweeping scan bar with a mono status line. */
const Loader = ({ message = 'Scanning deep space telemetry...' }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 min-h-[220px]" role="status" aria-live="polite">
      <div className="relative w-48 h-px bg-line-strong overflow-hidden" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-signal animate-sweep" />
      </div>
      <div className="mt-5 flex items-center gap-2 label text-fg-muted text-center">
        <span className="w-1.5 h-3 bg-signal animate-blink" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Loader;
