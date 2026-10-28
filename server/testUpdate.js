import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import app from './src/app.js';
import User from './src/models/User.js';
import Favorite from './src/models/Favorite.js';
import Watchlist from './src/models/Watchlist.js';
import axios from 'axios';

// Tests the UPDATE (PATCH) operations for Favorites and Watchlist
async function testUpdates() {
  await connectDB();
  const server = app.listen(5008, '127.0.0.1', async () => {
    const baseURL = 'http://127.0.0.1:5008/api';
    const email = `updater_${Date.now()}@cosmichorizon.space`;
    let passed = 0;
    const check = (name, cond) => {
      console.log(`${cond ? 'PASS' : 'FAIL'} - ${name}`);
      if (cond) passed++;
    };

    try {
      await axios.post(`${baseURL}/auth/register`, { name: 'Updater', email, password: 'Password123!' });
      // Registration now requires email verification: mark verified, then log in
      await User.updateOne({ email }, { isVerified: true });
      const login = await axios.post(`${baseURL}/auth/login`, { email, password: 'Password123!' });
      const auth = { headers: { Authorization: `Bearer ${login.data.data.token}` } };

      const fav = (await axios.post(`${baseURL}/user/favorites`, { itemType: 'apod', itemId: 'u1', title: 'Test Fav', description: 'desc' }, auth)).data.data;
      const wl = (await axios.post(`${baseURL}/user/watchlist`, { launchId: 'l1', launchName: 'Test Launch', launchDate: new Date().toISOString() }, auth)).data.data;

      const f = (await axios.patch(`${baseURL}/user/favorites/${fav._id}`, { notes: 'My note' }, auth)).data.data;
      check('Update favorite notes', f.notes === 'My note');

      const w = (await axios.patch(`${baseURL}/user/watchlist/${wl._id}`, { priority: 'high', notes: 'Watch live' }, auth)).data.data;
      check('Update watchlist priority and notes', w.priority === 'high' && w.notes === 'Watch live');

      try {
        await axios.patch(`${baseURL}/user/watchlist/${wl._id}`, { priority: 'urgent' }, auth);
        check('Reject invalid priority', false);
      } catch (e) {
        check('Reject invalid priority (400)', e.response.status === 400);
      }

      try {
        await axios.patch(`${baseURL}/user/favorites/${fav._id}`, { notes: 'x'.repeat(501) }, auth);
        check('Reject notes over 500 chars', false);
      } catch (e) {
        check('Reject notes over 500 chars (400)', e.response.status === 400);
      }

      try {
        await axios.patch(`${baseURL}/user/favorites/${fav._id}`, { notes: 'hack' });
        check('Require authentication', false);
      } catch (e) {
        check('Require authentication (401)', e.response.status === 401);
      }

      console.log(`\n${passed}/5 tests passed`);
    } catch (err) {
      console.error('Test error:', err.response?.data || err.message);
    } finally {
      const u = await User.findOne({ email });
      if (u) {
        await Favorite.deleteMany({ user: u._id });
        await Watchlist.deleteMany({ user: u._id });
        await User.deleteOne({ _id: u._id });
      }
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    }
  });
}

testUpdates();
