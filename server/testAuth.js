import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import app from './src/app.js';
import User from './src/models/User.js';
import axios from 'axios';

// Expects an error response with the given status
const expectStatus = async (promise, status) => {
  try {
    await promise;
  } catch (err) {
    console.log('   Status:', err.response?.status, 'Message:', err.response?.data?.message);
    if (err.response?.status !== status) throw new Error(`Expected ${status}, got ${err.response?.status}`);
    return;
  }
  throw new Error(`Should have failed with ${status}`);
};

async function runFullAuthTests() {
  await connectDB();
  const server = app.listen(5005, '127.0.0.1', async () => {
    const baseURL = 'http://127.0.0.1:5005/api/auth';
    const testEmail = `viva_${Date.now()}@cosmichorizon.space`;
    const testPassword = 'Password123!';
    try {
      // 1. Register -> no JWT, verification required
      console.log('1. Testing Registration (expect verification required, no token)...');
      const regRes = await axios.post(`${baseURL}/register`, {
        name: 'Commander Shepard',
        email: testEmail,
        password: testPassword,
      });
      console.log('   Status:', regRes.status, 'Requires verification:', regRes.data.data.requiresVerification);
      if (regRes.data.data.token) throw new Error('Register must not return a token');
      const devLink = regRes.data.data.devVerificationLink;
      if (!devLink) throw new Error('No dev verification link (is SMTP configured or NODE_ENV=production?)');
      const verifyToken = devLink.split('/verify-email/')[1];

      // 2. Duplicate registration
      console.log('2. Testing Duplicate Registration (expect 409)...');
      await expectStatus(
        axios.post(`${baseURL}/register`, { name: 'Commander Shepard', email: testEmail, password: testPassword }),
        409
      );

      // 3. Login before verification is blocked
      console.log('3. Testing Login before verification (expect 403)...');
      await expectStatus(axios.post(`${baseURL}/login`, { email: testEmail, password: testPassword }), 403);

      // 4. Invalid verification token
      console.log('4. Testing invalid verification token (expect 400)...');
      await expectStatus(axios.get(`${baseURL}/verify/not-a-real-token`), 400);

      // 5. Valid verification
      console.log('5. Testing email verification...');
      const verifyRes = await axios.get(`${baseURL}/verify/${verifyToken}`);
      console.log('   Status:', verifyRes.status, 'Message:', verifyRes.data.message);

      // 5b. Token cannot be reused
      console.log('   Reusing the same link (expect 400)...');
      await expectStatus(axios.get(`${baseURL}/verify/${verifyToken}`), 400);

      // 6. Login after verification
      console.log('6. Testing Login after verification...');
      const loginRes = await axios.post(`${baseURL}/login`, { email: testEmail, password: testPassword });
      const token = loginRes.data.data.token;
      console.log('   Status:', loginRes.status, 'Token received:', !!token);
      const headers = { Authorization: `Bearer ${token}` };

      // 7. Protected profile
      console.log('7. Testing Protected Profile...');
      const profileRes = await axios.get(`${baseURL}/profile`, { headers });
      console.log('   Status:', profileRes.status, 'User:', profileRes.data.data.name);

      // 8. Update profile
      console.log('8. Testing Update Profile...');
      const updateRes = await axios.put(
        `${baseURL}/profile`,
        { name: 'Commander Shepard (Spectre)', bio: 'Normandy SR-2 commanding officer' },
        { headers }
      );
      console.log('   Status:', updateRes.status, 'Updated Name:', updateRes.data.data.name);

      // 9. Unauthorized access
      console.log('9. Testing Unauthorized Access (expect 401)...');
      await expectStatus(axios.get(`${baseURL}/profile`), 401);

      // 10. Resend verification (generic response, no enumeration)
      console.log('10. Testing Resend Verification (always 200)...');
      const resend = await axios.post(`${baseURL}/resend-verification`, { email: 'nobody@cosmichorizon.space' });
      console.log('   Status:', resend.status, 'Message:', resend.data.message);

      console.log('\n=============================================');
      console.log('>>> ALL AUTHENTICATION + EMAIL VERIFICATION TESTS PASSED <<<');
      console.log('=============================================\n');
    } catch (e) {
      console.error('Test Failed:', e.message);
    } finally {
      await User.deleteOne({ email: testEmail });
      server.close();
      process.exit(0);
    }
  });
}

runFullAuthTests();
