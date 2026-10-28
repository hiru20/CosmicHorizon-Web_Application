// Display formatters for telemetry readouts (no data logic)
const pad = (n) => String(n).padStart(2, '0');

export const formatLat = (lat) => `${Math.abs(Number(lat)).toFixed(4)}° ${Number(lat) > 0 ? 'N' : 'S'}`;
export const formatLng = (lng) => `${Math.abs(Number(lng)).toFixed(4)}° ${Number(lng) > 0 ? 'E' : 'W'}`;

/** "T- 02D 14:22:09" from a positive millisecond delta */
export const formatTMinus = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `T- ${pad(d)}D ${pad(h)}:${pad(m)}:${pad(s)}`;
};
