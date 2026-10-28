import { errorResponse } from '../utils/responseHandler.js';

/**
 * Handle 404 - Not Found for unmapped routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose schema validation (e.g. name too long): client error, not a crash
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }
  // Unique index race (two sign-ups with the same email at once)
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists';
  }
  // Malformed ObjectId in a route parameter
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};
