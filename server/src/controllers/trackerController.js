import { fetchIssPosition } from '../services/issService.js';
import { successResponse } from '../utils/responseHandler.js';

/**
 * @desc    Get real-time ISS coordinates and telemetry
 * @route   GET /api/space/tracker/iss
 * @access  Public
 */
export const getIssTelemetry = async (req, res, next) => {
  try {
    const telemetry = await fetchIssPosition();
    return successResponse(res, telemetry, 'ISS telemetry retrieved successfully');
  } catch (error) {
    next(error);
  }
};
