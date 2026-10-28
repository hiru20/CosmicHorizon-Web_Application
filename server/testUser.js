import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import app from './src/app.js';
import User from './src/models/User.js';
import Favorite from './src/models/Favorite.js';
import Watchlist from './src/models/Watchlist.js';
import axios from 'axios';

async function testUserPersistence() {
  await connectDB();
  const server = app.listen(5007, '127.0.0.1', async () => {
    try {
      const baseURL = 'http://127.0.0.1:5007/api';
      const testEmail = `persister_${Date.now()}@cosmichorizon.space`;
      const testPassword = 'Password123!';

      // 1. Register user
      console.log('1. Registering user for persistence test...');
      await axios.post(`${baseURL}/auth/register`, {
        name: 'Major Tom',
        email: testEmail,
        password: testPassword,
      });
      // Registration now requires email verification: mark verified, then log in
      await User.updateOne({ email: testEmail }, { isVerified: true });
      const login = await axios.post(`${baseURL}/auth/login`, { email: testEmail, password: testPassword });
      const token = login.data.data.token;
      const headers = { Authorization: `Bearer ${token}` };

      // 2. Add Favorite
      console.log('2. Adding APOD favorite...');
      const favRes = await axios.post(
        `${baseURL}/user/favorites`,
        {
          itemType: 'apod',
          itemId: '2026-10-08',
          title: 'Carina Nebula Deep Field',
          imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
          description: 'Cosmic clouds of Carina',
        },
        { headers }
      );
      console.log('   Status:', favRes.status, 'Favorite Title:', favRes.data.data.title);
      const favId = favRes.data.data._id;

      // 3. Prevent duplicate favorite
      console.log('3. Checking duplicate favorite prevention (expect 409)...');
      try {
        await axios.post(
          `${baseURL}/user/favorites`,
          {
            itemType: 'apod',
            itemId: '2026-10-08',
            title: 'Carina Nebula Deep Field',
          },
          { headers }
        );
        throw new Error('Should have failed with 409');
      } catch (e) {
        console.log('   Duplicate status:', e.response?.status);
        if (e.response?.status !== 409) throw e;
      }

      // 4. Add Watchlist Item
      console.log('4. Adding launch to watchlist...');
      const watchRes = await axios.post(
        `${baseURL}/user/watchlist`,
        {
          launchId: 'launch-001',
          launchName: 'Falcon 9 Block 5 | Starlink Group 7-18',
          launchDate: new Date(Date.now() + 86400000).toISOString(),
          agency: 'SpaceX',
          rocket: 'Falcon 9',
          status: 'Go',
        },
        { headers }
      );
      console.log('   Status:', watchRes.status, 'Watchlist Launch:', watchRes.data.data.launchName);
      const watchId = watchRes.data.data._id;

      // 5. Test Dashboard summary
      console.log('5. Testing User Dashboard summary...');
      const dashRes = await axios.get(`${baseURL}/user/dashboard`, { headers });
      console.log('   Status:', dashRes.status, 'Metrics:', dashRes.data.data.metrics);
      if (
        dashRes.data.data.metrics.totalFavorites !== 1 ||
        dashRes.data.data.metrics.totalWatchlist !== 1 ||
        !dashRes.data.data.nextLaunch
      ) {
        throw new Error('Dashboard summary metrics mismatch');
      }

      // 6. Delete Favorite & Watchlist item
      console.log('6. Removing favorite and watchlist items...');
      const delFav = await axios.delete(`${baseURL}/user/favorites/${favId}`, { headers });
      const delWatch = await axios.delete(`${baseURL}/user/watchlist/${watchId}`, { headers });
      console.log('   Delete favorite status:', delFav.status, 'Delete watchlist status:', delWatch.status);

      // 7. Verify deletion
      const finalDash = await axios.get(`${baseURL}/user/dashboard`, { headers });
      console.log('   Post-delete Metrics:', finalDash.data.data.metrics);
      if (
        finalDash.data.data.metrics.totalFavorites !== 0 ||
        finalDash.data.data.metrics.totalWatchlist !== 0
      ) {
        throw new Error('Items were not removed properly');
      }

      // Cleanup
      await User.deleteOne({ email: testEmail });
      await Favorite.deleteMany({ user: login.data.data.user.id });
      await Watchlist.deleteMany({ user: login.data.data.user.id });

      console.log('\n=============================================');
      console.log('>>> ALL USER & DASHBOARD TESTS PASSED 100% <<<');
      console.log('=============================================\n');
    } catch (e) {
      console.error('Test Failed:', e.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

testUserPersistence();
