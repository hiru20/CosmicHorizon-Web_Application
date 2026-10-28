// Day/night terminator as a [lat, lng] polygon covering the night side of Earth.
// Low-precision solar position (accurate to well under a degree), computed from the clock only.
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export const computeTerminator = (date = new Date(), step = 2) => {
  const julianDay = date.getTime() / 86400000 + 2440587.5;
  const n = julianDay - 2451545.0;

  // Greenwich mean sidereal time, in hours
  const gmst = (((18.697374558 + 24.06570982441908 * n) % 24) + 24) % 24;

  // Sun ecliptic longitude -> equatorial coordinates
  const meanLong = (280.46 + 0.9856474 * n) % 360;
  const meanAnomaly = ((357.528 + 0.9856003 * n) % 360) * RAD;
  const eclipticLong = (meanLong + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) * RAD;
  const obliquity = (23.439 - 0.0000004 * n) * RAD;
  const alpha = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLong), Math.cos(eclipticLong)) * DEG;
  const delta = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLong)) * DEG;

  const points = [];
  for (let lng = -180; lng <= 180; lng += step) {
    const hourAngle = (gmst * 15 + lng - alpha) * RAD;
    const lat = Math.atan(-Math.cos(hourAngle) / Math.tan(delta * RAD)) * DEG;
    points.push([lat, lng]);
  }

  // Close the polygon over the pole that is in darkness
  const pole = delta < 0 ? 90 : -90;
  points.unshift([pole, -180]);
  points.push([pole, 180]);
  return points;
};
