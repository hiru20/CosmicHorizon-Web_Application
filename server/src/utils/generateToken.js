import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_for_dev_cosmichorizon',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};
