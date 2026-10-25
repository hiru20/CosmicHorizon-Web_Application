import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Favorite from './src/models/Favorite.js';
import Watchlist from './src/models/Watchlist.js';

const viewDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cosmichorizon';
    await mongoose.connect(uri);

    console.log('\n======================================================');
    console.log(`📡 Connected to Database: [ ${mongoose.connection.name} ]`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    console.log('======================================================\n');

    // 1. Users
    const users = await User.find().select('name email bio createdAt');
    console.log(`👤 USERS (${users.length} records):`);
    console.table(
      users.map((u) => ({
        ID: u._id.toString(),
        Name: u.name,
        Email: u.email,
        Created: u.createdAt?.toISOString().split('T')[0],
      }))
    );

    // 2. Favorites
    const favorites = await Favorite.find().populate('user', 'name email');
    console.log(`\n⭐ FAVORITES (${favorites.length} records):`);
    console.table(
      favorites.map((f) => ({
        Type: f.itemType,
        Title: f.title.substring(0, 35),
        ItemId: f.itemId,
        SavedBy: f.user?.name || f.user,
      }))
    );

    // 3. Watchlist
    const watchlist = await Watchlist.find().populate('user', 'name email');
    console.log(`\n🚀 WATCHLIST LAUNCHES (${watchlist.length} records):`);
    console.table(
      watchlist.map((w) => ({
        Mission: w.launchName.substring(0, 30),
        Agency: w.agency,
        Date: w.launchDate ? new Date(w.launchDate).toLocaleDateString() : 'TBD',
        Status: w.status,
        SavedBy: w.user?.name || w.user,
      }))
    );

    console.log('\n======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error reading database:', error.message);
    process.exit(1);
  }
};

viewDatabase();
