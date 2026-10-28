import React, { useEffect, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');

/** Live UTC clock in mono, ticking each second. Display only. */
const UtcClock = ({ className = '', showDate = false }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  const date = `${now.getUTCFullYear()}.${pad(now.getUTCMonth() + 1)}.${pad(now.getUTCDate())}`;

  return (
    <time dateTime={now.toISOString()} className={`telemetry text-[0.6875rem] tracking-label text-fg-muted ${className}`}>
      {showDate && <span className="mr-2 text-fg-faint">{date}</span>}
      <span className="text-fg">{time}</span>
      <span className="ml-1.5 text-fg-faint">UTC</span>
    </time>
  );
};

export default UtcClock;
