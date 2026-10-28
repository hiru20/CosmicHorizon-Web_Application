import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    launchId: {
      type: String,
      required: true,
    },
    launchName: {
      type: String,
      required: true,
      trim: true,
    },
    launchDate: {
      type: String,
      required: true,
    },
    agency: {
      type: String,
      default: 'Unknown Agency',
    },
    rocket: {
      type: String,
      default: 'Rocket',
    },
    padLocation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Go',
    },
    image: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    reminderTime: {
      type: String,
      enum: ['none', '15m', '1h', '24h'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate saves per user
watchlistSchema.index({ user: 1, launchId: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
