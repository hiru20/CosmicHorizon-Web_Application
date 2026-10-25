import { getApod, getMarsPhotos, getNeoAsteroids } from '../services/nasaService.js';
import { successResponse } from '../utils/responseHandler.js';

/**
 * @desc    Get Astronomy Picture of the Day
 * @route   GET /api/space/nasa/apod
 * @access  Public
 */
export const getApodController = async (req, res, next) => {
  try {
    const { date } = req.query;
    const apod = await getApod(date);
    return successResponse(res, apod, 'APOD retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Mars Rover Photos
 * @route   GET /api/space/nasa/mars
 * @access  Public
 */
export const getMarsController = async (req, res, next) => {
  try {
    const { rover, sol, camera, page } = req.query;
    const mars = await getMarsPhotos({
      rover: rover || 'perseverance',
      sol: sol ? parseInt(sol, 10) : 1000,
      camera,
      page: page ? parseInt(page, 10) : 1,
    });

    return successResponse(res, mars, 'Mars rover photos retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Near Earth Asteroids feed
 * @route   GET /api/space/nasa/neo
 * @access  Public
 */
export const getNeoController = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const neo = await getNeoAsteroids(startDate, endDate);
    return successResponse(res, neo, 'NEO asteroid feed retrieved');
  } catch (error) {
    next(error);
  }
};
