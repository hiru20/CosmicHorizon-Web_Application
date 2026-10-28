import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { sendVerificationEmail } from '../services/emailService.js';

const VERIFICATION_HOURS = 24;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Creates a fresh verification token for the user, stores only its hash,
 * and emails the raw token. Returns the email service result.
 */
const issueVerification = async (user) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const otpCode = String(crypto.randomInt(100000, 1000000));
  user.verificationToken = hashToken(rawToken);
  user.verificationCode = hashToken(otpCode);
  user.verificationExpires = new Date(Date.now() + VERIFICATION_HOURS * 60 * 60 * 1000);
  await user.save();

  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const fallbackLink = `${clientUrl}/verify-email/${rawToken}`;
  try {
    return await sendVerificationEmail(user, rawToken, otpCode);
  } catch (mailError) {
    console.error('[Email] Failed to send verification email:', mailError.message);
    return { sent: false, devLink: fallbackLink, mailError: mailError.message };
  }
};

/**
 * @desc    Register a new user and send a verification email
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    // Create user (unverified until the email link is opened)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      isVerified: false,
    });

    const emailResult = await issueVerification(user);

    const data = {
      email: user.email,
      requiresVerification: true,
      emailSent: !!emailResult.sent,
    };
    // Dev convenience only: expose the link when SMTP is not configured
    if (emailResult.devLink && process.env.NODE_ENV !== 'production') {
      data.devVerificationLink = emailResult.devLink;
    }
    if (emailResult.mailError && process.env.NODE_ENV !== 'production') {
      data.mailError = emailResult.mailError;
    }

    return successResponse(
      res,
      data,
      'Account created. Please check your email to verify your account.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address using the emailed token
 * @route   GET /api/auth/verify/:token
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: hashToken(req.params.token),
      verificationExpires: { $gt: new Date() },
    }).select('+verificationToken +verificationExpires');

    if (!user) {
      return errorResponse(res, 'Verification link is invalid or has expired', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        email: user.email,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      },
      'Email verified successfully. You are now signed in!'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email address using the 6-digit OTP code sent via email
 * @route   POST /api/auth/verify-code
 * @access  Public
 */
export const verifyEmailCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return errorResponse(res, 'Please provide both email and 6-digit verification code', 400);
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      verificationCode: hashToken(String(code).trim()),
      verificationExpires: { $gt: new Date() },
    }).select('+verificationCode +verificationExpires');

    if (!user) {
      return errorResponse(res, 'Invalid or expired verification code', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        email: user.email,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      },
      'Email verified successfully!'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend the verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Please provide your email', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Same response whether or not the account exists (no account enumeration)
    const data = {};
    if (user && user.isVerified === false) {
      try {
        const result = await issueVerification(user);
        if (result.devLink && process.env.NODE_ENV !== 'production') {
          data.devVerificationLink = result.devLink;
        }
      } catch (mailError) {
        console.error('[Email] Failed to resend verification email:', mailError.message);
      }
    }

    return successResponse(res, data, 'If an unverified account exists for this email, a new link has been sent.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Check for user (include password for verification)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Block login until the email is verified (only explicit false blocks)
    if (user.isVerified === false) {
      return errorResponse(res, 'Please verify your email before logging in', 403);
    }

    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        token,
      },
      'Logged in successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      'User profile retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const { name, bio, avatar, password } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (password) {
      if (password.length < 6) {
        return errorResponse(res, 'Password must be at least 6 characters long', 400);
      }
      user.password = password;
    }

    const updatedUser = await user.save();

    return successResponse(
      res,
      {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        createdAt: updatedUser.createdAt,
      },
      'User profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};
