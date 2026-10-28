import express from 'express';
import {
  getFavorites,
  addFavorite,
  updateFavorite,
  removeFavorite,
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  getDashboardSummary,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboardSummary);

// Favorites CRUD
router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.patch('/favorites/:id', updateFavorite);
router.delete('/favorites/:id', removeFavorite);

// Watchlist CRUD
router.get('/watchlist', getWatchlist);
router.post('/watchlist', addToWatchlist);
router.patch('/watchlist/:id', updateWatchlistItem);
router.delete('/watchlist/:id', removeFromWatchlist);

export default router;
