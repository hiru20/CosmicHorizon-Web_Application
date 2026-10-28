import jwt from 'jsonwebtoken';

const DEV_FALLBACK_SECRET = 'fallback_secret_for_dev_cosmichorizon';

/**
 * JWT signing secret. The dev fallback is public (it is in the source), so it is
 * refused in production: tokens signed with it could be forged by anyone.
 */
export const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return DEV_FALLBACK_SECRET;
};

/**
 * Generate a signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};
