import { getUpcomingLaunches, getLaunchById } from '../services/launchService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

/**
 * @desc    Get upcoming rocket launches with filters
 * @route   GET /api/space/launches
 * @access  Public
 */
export const getLaunches = async (req, res, next) => {
  try {
    const { search, agency, status, limit } = req.query;
    const launches = await getUpcomingLaunches({
      search,
      agency,
      status,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    return successResponse(
      res,
      {
        count: launches.length,
        launches,
      },
      'Launches fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific launch by ID
 * @route   GET /api/space/launches/:id
 * @access  Public
 */
export const getSingleLaunch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const launch = await getLaunchById(id);

    if (!launch) {
      return errorResponse(res, 'Launch not found', 404);
    }

    return successResponse(res, launch, 'Launch details retrieved');
  } catch (error) {
    next(error);
  }
};
