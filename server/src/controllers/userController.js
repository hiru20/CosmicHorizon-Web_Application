import Favorite from '../models/Favorite.js';
import Watchlist from '../models/Watchlist.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

// ================= FAVORITES =================

/**
 * @desc    Get all favorites of logged-in user
 * @route   GET /api/user/favorites
 * @access  Private
 */
export const getFavorites = async (req, res, next) => {
  try {
    const { itemType } = req.query;
    const filter = { user: req.user._id };
    if (itemType) filter.itemType = itemType;

    const favorites = await Favorite.find(filter).sort({ createdAt: -1 });
    return successResponse(res, favorites, 'Favorites fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add an item to favorites
 * @route   POST /api/user/favorites
 * @access  Private
 */
export const addFavorite = async (req, res, next) => {
  try {
    const { itemType, itemId, title, imageUrl, description, extraData } = req.body;

    if (!itemType || !itemId || !title) {
      return errorResponse(res, 'itemType, itemId, and title are required', 400);
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      itemType,
      itemId,
    });

    if (existing) {
      return errorResponse(res, 'Item already in favorites', 409);
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      itemType,
      itemId,
      title,
      imageUrl: imageUrl || '',
      description: description || '',
      extraData: extraData || {},
    });

    return successResponse(res, favorite, 'Added to favorites', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item from favorites
 * @route   DELETE /api/user/favorites/:id
 * @access  Private
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Can delete by Mongo _id OR by itemId
    let favorite = await Favorite.findOne({ _id: id, user: req.user._id });
    if (!favorite) {
      favorite = await Favorite.findOne({ itemId: id, user: req.user._id });
    }

    if (!favorite) {
      return errorResponse(res, 'Favorite item not found', 404);
    }

    await Favorite.deleteOne({ _id: favorite._id });
    return successResponse(res, { id: favorite._id }, 'Removed from favorites');
  } catch (error) {
    next(error);
  }
};

// ================= WATCHLIST =================

/**
 * @desc    Get user's launch watchlist
 * @route   GET /api/user/watchlist
 * @access  Private
 */
export const getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.find({ user: req.user._id }).sort({ launchDate: 1 });
    return successResponse(res, items, 'Watchlist fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add launch to watchlist
 * @route   POST /api/user/watchlist
 * @access  Private
 */
export const addToWatchlist = async (req, res, next) => {
  try {
    const { launchId, launchName, launchDate, agency, rocket, padLocation, status, image } = req.body;

    if (!launchId || !launchName || !launchDate) {
      return errorResponse(res, 'launchId, launchName, and launchDate are required', 400);
    }

    const existing = await Watchlist.findOne({
      user: req.user._id,
      launchId,
    });

    if (existing) {
      return errorResponse(res, 'Launch is already in your watchlist', 409);
    }

    const item = await Watchlist.create({
      user: req.user._id,
      launchId,
      launchName,
      launchDate,
      agency: agency || 'Unknown Agency',
      rocket: rocket || 'Rocket',
      padLocation: padLocation || '',
      status: status || 'Go',
      image: image || '',
    });

    return successResponse(res, item, 'Added to watchlist', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove launch from watchlist
 * @route   DELETE /api/user/watchlist/:id
 * @access  Private
 */
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { id } = req.params;

    let item = await Watchlist.findOne({ _id: id, user: req.user._id });
    if (!item) {
      item = await Watchlist.findOne({ launchId: id, user: req.user._id });
    }

    if (!item) {
      return errorResponse(res, 'Watchlist item not found', 404);
    }

    await Watchlist.deleteOne({ _id: item._id });
    return successResponse(res, { id: item._id }, 'Removed from watchlist');
  } catch (error) {
    next(error);
  }
};

// ================= DASHBOARD SUMMARY =================

/**
 * @desc    Get aggregate user dashboard data
 * @route   GET /api/user/dashboard
 * @access  Private
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parallel fetch for optimal performance
    const [totalFavorites, totalWatchlist, recentFavorites, watchlistItems] = await Promise.all([
      Favorite.countDocuments({ user: userId }),
      Watchlist.countDocuments({ user: userId }),
      Favorite.find({ user: userId }).sort({ createdAt: -1 }).limit(6),
      Watchlist.find({ user: userId }).sort({ launchDate: 1 }).limit(5),
    ]);

    // Calculate next upcoming launch from user's watchlist
    const now = new Date();
    const nextLaunch = watchlistItems.find((l) => new Date(l.launchDate) > now) || watchlistItems[0] || null;

    return successResponse(
      res,
      {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
          bio: req.user.bio,
          joined: req.user.createdAt,
        },
        metrics: {
          totalFavorites,
          totalWatchlist,
        },
        nextLaunch,
        recentFavorites,
        watchlistItems,
      },
      'Dashboard data loaded successfully'
    );
  } catch (error) {
    next(error);
  }
};
