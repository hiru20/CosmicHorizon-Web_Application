import axios from 'axios';
import { mockApodData, mockMarsData, mockNeoData } from '../utils/mockData.js';

const apodCache = new Map();
const marsCache = new Map();

/**
 * Fetch NASA Astronomy Picture of the Day (APOD)
 */
export const getApod = async (date) => {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const cacheKey = date || 'today';

  if (apodCache.has(cacheKey)) {
    return apodCache.get(cacheKey);
  }

  try {
    const params = { api_key: apiKey };
    if (date) params.date = date;

    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params,
      timeout: 6000,
    });

    const data = {
      ...response.data,
      isLive: true,
    };

    apodCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`[NASA Service Warning] APOD fetch failed (${error.message}). Serving fallback APOD.`);
    return {
      ...mockApodData,
      date: date || mockApodData.date,
      isLive: false,
    };
  }
};

/**
 * Fetch Mars Rover Photos (Curiosity, Perseverance, Opportunity, Spirit)
 */
export const getMarsPhotos = async ({ rover = 'perseverance', sol = 1000, camera, page = 1 }) => {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const cacheKey = `${rover}-${sol}-${camera || 'all'}-${page}`;

  if (marsCache.has(cacheKey)) {
    return marsCache.get(cacheKey);
  }

  try {
    const params = {
      sol,
      page,
      api_key: apiKey,
    };
    if (camera && camera !== 'all') {
      params.camera = camera;
    }

    const response = await axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover.toLowerCase()}/photos`,
      {
        params,
        timeout: 7000,
      }
    );

    const photos = response.data?.photos || [];
    const result = {
      rover,
      sol,
      totalPhotos: photos.length,
      photos: photos.slice(0, 24), // return top 24 for optimal responsive grid display
      isLive: true,
    };

    marsCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`[NASA Service Warning] Mars photos fetch failed (${error.message}). Serving fallback Mars imagery.`);
    return {
      rover,
      sol,
      totalPhotos: mockMarsData.length,
      photos: mockMarsData,
      isLive: false,
    };
  }
};

/**
 * Fetch Near Earth Object (NEO) Asteroid Feed
 */
export const getNeoAsteroids = async (startDate, endDate) => {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  try {
    const today = new Date().toISOString().split('T')[0];
    const sDate = startDate || today;
    const eDate = endDate || today;

    const response = await axios.get('https://api.nasa.gov/neo/rest/v1/feed', {
      params: {
        start_date: sDate,
        end_date: eDate,
        api_key: apiKey,
      },
      timeout: 7000,
    });

    const neoFeed = response.data?.near_earth_objects || {};
    const flatList = [];
    Object.keys(neoFeed).forEach((d) => {
      neoFeed[d].forEach((item) => flatList.push(item));
    });

    return {
      elementCount: response.data?.element_count || flatList.length,
      asteroids: flatList.slice(0, 15),
      isLive: true,
    };
  } catch (error) {
    console.warn(`[NASA Service Warning] NEO fetch failed (${error.message}). Serving fallback asteroid data.`);
    return {
      elementCount: mockNeoData.element_count,
      asteroids: mockNeoData.near_earth_objects,
      isLive: false,
    };
  }
};
