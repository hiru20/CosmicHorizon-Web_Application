import axios from 'axios';
import { mockIssData } from '../utils/mockData.js';

let cachedIssData = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2500; // 2.5 seconds cache to accommodate live polling

/**
 * Fetch real-time International Space Station coordinates and orbital metrics
 */
export const fetchIssPosition = async () => {
  const now = Date.now();
  if (cachedIssData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedIssData;
  }

  try {
    const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544', {
      timeout: 5000,
    });

    const data = {
      name: 'International Space Station (ISS)',
      norad_id: response.data.id || 25544,
      latitude: parseFloat(response.data.latitude.toFixed(4)),
      longitude: parseFloat(response.data.longitude.toFixed(4)),
      altitude: parseFloat(response.data.altitude.toFixed(2)), // in km
      velocity: parseFloat(response.data.velocity.toFixed(2)), // in km/h
      visibility: response.data.visibility || 'daylight',
      footprint: parseFloat(response.data.footprint.toFixed(2)),
      timestamp: response.data.timestamp,
      solar_lat: response.data.solar_lat,
      solar_lon: response.data.solar_lon,
      units: response.data.units || 'kilometers',
      isLive: true,
    };

    cachedIssData = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.warn(`[ISS Service Warning] Live API failed (${error.message}). Serving fallback telemetry.`);
    // Return mock data with updated timestamp
    return {
      ...mockIssData,
      timestamp: Math.floor(Date.now() / 1000),
      isLive: false,
    };
  }
};
