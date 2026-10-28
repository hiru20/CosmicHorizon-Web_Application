import React, { useState, useEffect } from 'react';

const pad = (n) => String(n).padStart(2, '0');

/**
 * T-minus countdown to `targetDate`.
 * variant: 'inline' (default, compact mono line) | 'large' (segmented DD HH MM SS readout)
 *          | 'stacked' (days large over HH:MM:SS, for narrow manifest rows)
 */
const CountdownTimer = ({ targetDate, variant = 'inline', className = '' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (variant === 'large') {
    if (timeLeft.isPast) {
      return (
        <div className={`flex items-baseline gap-4 ${className}`}>
          <span className="telemetry text-6xl sm:text-8xl leading-none text-signal">T+</span>
          <span className="label text-fg">Liftoff / in flight</span>
        </div>
      );
    }
    const segments = [
      { value: pad(timeLeft.days), unit: 'Days' },
      { value: pad(timeLeft.hours), unit: 'Hrs' },
      { value: pad(timeLeft.minutes), unit: 'Min' },
      { value: pad(timeLeft.seconds), unit: 'Sec' },
    ];
    return (
      <div className={`flex items-start ${className}`} role="timer" aria-label={`T minus ${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} minutes`}>
        <span className="telemetry text-3xl sm:text-5xl leading-none text-fg-faint mr-3 sm:mr-5 pt-1" aria-hidden="true">T−</span>
        {segments.map((s, i) => (
          <React.Fragment key={s.unit}>
            {i > 0 && (
              <span className="telemetry text-5xl sm:text-7xl lg:text-8xl leading-none text-fg-faint px-1 sm:px-2" aria-hidden="true">
                :
              </span>
            )}
            <span className="flex flex-col items-start" aria-hidden="true">
              <span className={`telemetry text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight ${i === 3 ? 'text-signal' : 'text-fg'}`}>
                {s.value}
              </span>
              <span className="label text-fg-faint mt-2">{s.unit}</span>
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (variant === 'stacked') {
    if (timeLeft.isPast) {
      return (
        <span className={`flex flex-col ${className}`}>
          <span className="telemetry text-3xl leading-none text-signal">T+</span>
          <span className="label text-fg-faint mt-1.5">Liftoff</span>
        </span>
      );
    }
    return (
      <span className={`flex flex-col ${className}`}>
        <span className="telemetry text-3xl leading-none text-fg">
          {pad(timeLeft.days)}
          <span className="text-sm text-fg-faint ml-0.5">d</span>
        </span>
        <span className="telemetry text-[0.6875rem] text-fg-muted mt-1.5">
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </span>
    );
  }

  if (timeLeft.isPast) {
    return (
      <span className={`inline-flex items-center gap-2 telemetry text-xs text-signal ${className}`}>
        <span className="w-1 h-1 bg-signal animate-blink" aria-hidden="true" />
        T+ LIFTOFF
      </span>
    );
  }

  return (
    <span className={`telemetry text-xs text-fg whitespace-nowrap ${className}`}>
      <span className="text-fg-faint">T−</span>
      {timeLeft.days > 0 && (
        <>
          {pad(timeLeft.days)}
          <span className="text-fg-faint">d </span>
        </>
      )}
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:<span className="text-fg-muted">{pad(timeLeft.seconds)}</span>
    </span>
  );
};

export default CountdownTimer;
