import axios from 'axios';
import { mockLaunches } from '../utils/mockData.js';

let cachedLaunches = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache to prevent LL2 rate limits

/**
 * Format raw Launch Library 2 response into uniform data model
 */
const formatLaunch = (raw) => ({
  id: raw.id,
  name: raw.name,
  status: {
    id: raw.status?.id,
    name: raw.status?.name || 'Status Unknown',
    abbrev: raw.status?.abbrev || 'TBD',
    description: raw.status?.description || '',
  },
  net: raw.net, // "No Earlier Than" ISO launch date
  window_start: raw.window_start,
  window_end: raw.window_end,
  launch_service_provider: {
    id: raw.launch_service_provider?.id,
    name: raw.launch_service_provider?.name || 'Unknown Provider',
    type: raw.launch_service_provider?.type || 'Commercial',
    country_code: raw.launch_service_provider?.country_code || 'INT',
  },
  rocket: {
    id: raw.rocket?.id,
    configuration: {
      name: raw.rocket?.configuration?.name || 'Rocket',
      family: raw.rocket?.configuration?.family || '',
      full_name: raw.rocket?.configuration?.full_name || raw.rocket?.configuration?.name || 'Rocket',
    },
  },
  mission: {
    id: raw.mission?.id,
    name: raw.mission?.name || 'Payload Mission',
    description: raw.mission?.description || 'Classified or general deployment mission.',
    type: raw.mission?.type || 'Space Exploration',
    orbit: {
      name: raw.mission?.orbit?.name || 'Low Earth Orbit',
      abbrev: raw.mission?.orbit?.abbrev || 'LEO',
    },
  },
  pad: {
    id: raw.pad?.id,
    name: raw.pad?.name || 'Launch Complex',
    location: {
      name: raw.pad?.location?.name || 'Earth Spaceport',
      country_code: raw.pad?.location?.country_code || '',
    },
  },
  image: raw.image || 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800&auto=format&fit=crop&q=80',
  webcast_live: raw.webcast_live || false,
  isLive: true,
});

/**
 * Get upcoming launches with filtering and caching
 */
export const getUpcomingLaunches = async ({ search, agency, status, limit = 20 }) => {
  const now = Date.now();
  let launches = cachedLaunches;

  if (!launches || now - lastFetchTime > CACHE_TTL_MS) {
    try {
      const response = await axios.get(
        `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=${limit}&mode=detailed`,
        { timeout: 7000 }
      );

      if (response.data && Array.isArray(response.data.results)) {
        launches = response.data.results.map(formatLaunch);
        cachedLaunches = launches;
        lastFetchTime = now;
      }
    } catch (error) {
      console.warn(`[Launch Service Warning] External Launch API unavailable (${error.message}). Using resilient mock launches.`);
      launches = mockLaunches;
    }
  }

  // If still no launches (e.g. empty results), use fallback
  if (!launches || launches.length === 0) {
    launches = mockLaunches;
  }

  // Apply search query filter
  let filtered = [...launches];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.launch_service_provider?.name.toLowerCase().includes(q) ||
        l.rocket?.configuration?.name.toLowerCase().includes(q) ||
        l.mission?.name.toLowerCase().includes(q)
    );
  }

  // Apply Agency filter
  if (agency && agency !== 'all') {
    const a = agency.toLowerCase();
    filtered = filtered.filter((l) =>
      l.launch_service_provider?.name.toLowerCase().includes(a)
    );
  }

  // Apply Status filter (Go, TBD, Hold)
  if (status && status !== 'all') {
    const s = status.toLowerCase();
    filtered = filtered.filter(
      (l) => l.status?.abbrev.toLowerCase() === s || l.status?.name.toLowerCase().includes(s)
    );
  }

  return filtered;
};

/**
 * Get launch details by ID
 */
export const getLaunchById = async (id) => {
  const launches = await getUpcomingLaunches({ limit: 30 });
  const found = launches.find((l) => String(l.id) === String(id));
  if (found) return found;

  // Check fallback list
  return mockLaunches.find((l) => String(l.id) === String(id)) || null;
};
