// Display helpers for already-fetched NeoWs records (read-only; no data is altered).
export const LUNAR_DISTANCE_KM = 384400;

export const missKm = (ast) => Number(ast?.close_approach_data?.[0]?.miss_distance?.kilometers || 0);
export const missLd = (ast) => missKm(ast) / LUNAR_DISTANCE_KM;
export const velocityKmh = (ast) => Number(ast?.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || 0);
export const avgDiameterKm = (ast) => {
  const min = Number(ast?.estimated_diameter?.kilometers?.estimated_diameter_min || 0.1);
  const max = Number(ast?.estimated_diameter?.kilometers?.estimated_diameter_max || 0.3);
  return (min + max) / 2;
};

/** Log10 position (0..1) of a lunar distance inside a decade-rounded domain */
export const logDomain = (values) => {
  const positive = values.filter((v) => v > 0);
  const lo = positive.length ? Math.pow(10, Math.floor(Math.log10(Math.min(...positive)))) : 0.1;
  const hi = positive.length ? Math.pow(10, Math.ceil(Math.log10(Math.max(...positive, 1.01)))) : 100;
  const min = Math.min(lo, 0.1);
  const max = Math.max(hi, 10);
  const scale = (v) => {
    const c = Math.min(Math.max(v, min), max);
    return (Math.log10(c) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
  };
  const ticks = [];
  for (let e = Math.log10(min); e <= Math.log10(max) + 1e-9; e += 1) ticks.push(Math.pow(10, e));
  return { min, max, scale, ticks };
};

export const formatLd = (v) => (v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2));
