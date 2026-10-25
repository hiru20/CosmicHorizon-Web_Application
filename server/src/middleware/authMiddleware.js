import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/responseHandler.js';

/**
 * Protect routes - verifies JWT in Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_for_dev_cosmichorizon'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return errorResponse(res, 'User belonging to this token no longer exists', 401);
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Error] Token verification failed:', error.message);
      return errorResponse(res, 'Not authorized, token failed or expired', 401);
    }
  } else {
    return errorResponse(res, 'Not authorized, no bearer token provided', 401);
  }
};
