import express from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  verifyEmailCode,
  resendVerification,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);
router.post('/verify-code', verifyEmailCode);
router.post('/resend-verification', resendVerification);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
