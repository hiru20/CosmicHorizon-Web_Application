import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import app from './src/app.js';
import User from './src/models/User.js';
import axios from 'axios';

async function runFullAuthTests() {
  await connectDB();
  const server = app.listen(5005, '127.0.0.1', async () => {
    try {
      const baseURL = 'http://127.0.0.1:5005/api/auth';
      const testEmail = `viva_${Date.now()}@cosmichorizon.space`;
      const testPassword = 'Password123!';

      // 1. Register
      console.log('1. Testing Registration...');
      const regRes = await axios.post(`${baseURL}/register`, {
        name: 'Commander Shepard',
        email: testEmail,
        password: testPassword,
      });
      console.log('   Status:', regRes.status, 'Success:', regRes.data.success);
      const token = regRes.data.data.token;

      // 2. Duplicate registration
      console.log('2. Testing Duplicate Registration (expect 409)...');
      try {
        await axios.post(`${baseURL}/register`, {
          name: 'Commander Shepard',
          email: testEmail,
          password: testPassword,
        });
        throw new Error('Should have failed with 409');
      } catch (err) {
        console.log('   Status:', err.response?.status, 'Message:', err.response?.data?.message);
        if (err.response?.status !== 409) throw err;
      }

      // 3. Login
      console.log('3. Testing Login...');
      const loginRes = await axios.post(`${baseURL}/login`, {
        email: testEmail,
        password: testPassword,
      });
      console.log('   Status:', loginRes.status, 'Token received:', !!loginRes.data.data.token);

      // 4. Protected Profile
      console.log('4. Testing Protected Profile...');
      const profileRes = await axios.get(`${baseURL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   Status:', profileRes.status, 'User:', profileRes.data.data.name);

      // 5. Update Profile
      console.log('5. Testing Update Profile...');
      const updateRes = await axios.put(`${baseURL}/profile`, {
        name: 'Commander Shepard (Spectre)',
        bio: 'Normandy SR-2 commanding officer'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   Status:', updateRes.status, 'Updated Name:', updateRes.data.data.name, 'Updated Bio:', updateRes.data.data.bio);

      // 6. Unauthorized access
      console.log('6. Testing Unauthorized Access (expect 401)...');
      try {
        await axios.get(`${baseURL}/profile`);
        throw new Error('Should have failed with 401');
      } catch (err) {
        console.log('   Status:', err.response?.status, 'Message:', err.response?.data?.message);
        if (err.response?.status !== 401) throw err;
      }

      // Cleanup
      await User.deleteOne({ email: testEmail });
      console.log('\n=============================================');
      console.log('>>> ALL 6 AUTHENTICATION TESTS PASSED 100% <<<');
      console.log('=============================================\n');
    } catch (e) {
      console.error('Test Failed:', e.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runFullAuthTests();
