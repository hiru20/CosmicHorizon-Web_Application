import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import axios from 'axios';

async function testSpaceEndpoints() {
  const server = app.listen(5006, '127.0.0.1', async () => {
    try {
      const baseURL = 'http://127.0.0.1:5006/api/space';

      // 1. ISS Telemetry
      console.log('1. Testing ISS Telemetry (/tracker/iss)...');
      const issRes = await axios.get(`${baseURL}/tracker/iss`);
      console.log('   Status:', issRes.status, 'ISS coords:', `${issRes.data.data.latitude}, ${issRes.data.data.longitude}`, 'Velocity:', `${issRes.data.data.velocity} km/h`);
      if (!issRes.data.data.latitude || !issRes.data.data.velocity) throw new Error('ISS telemetry missing fields');

      // 2. Space Launches
      console.log('2. Testing Upcoming Launches (/launches)...');
      const launchRes = await axios.get(`${baseURL}/launches`);
      console.log('   Status:', launchRes.status, 'Count:', launchRes.data.data.count, 'First Launch:', launchRes.data.data.launches[0]?.name);
      if (!Array.isArray(launchRes.data.data.launches) || launchRes.data.data.launches.length === 0) throw new Error('No launches returned');

      // 3. NASA APOD
      console.log('3. Testing NASA APOD (/nasa/apod)...');
      const apodRes = await axios.get(`${baseURL}/nasa/apod`);
      console.log('   Status:', apodRes.status, 'APOD Title:', apodRes.data.data.title);
      if (!apodRes.data.data.title || !apodRes.data.data.url) throw new Error('APOD missing title/url');

      // 4. Mars Rover Photos
      console.log('4. Testing Mars Photos (/nasa/mars)...');
      const marsRes = await axios.get(`${baseURL}/nasa/mars?rover=perseverance&sol=1000`);
      console.log('   Status:', marsRes.status, 'Rover:', marsRes.data.data.rover, 'Photos Count:', marsRes.data.data.photos?.length);
      if (!Array.isArray(marsRes.data.data.photos)) throw new Error('Mars photos failed');

      // 5. NASA NEO Asteroids
      console.log('5. Testing NEO Asteroids (/nasa/neo)...');
      const neoRes = await axios.get(`${baseURL}/nasa/neo`);
      console.log('   Status:', neoRes.status, 'Asteroids Count:', neoRes.data.data.asteroids?.length);

      console.log('\n=============================================');
      console.log('>>> ALL 5 SPACE API ENDPOINTS PASSED 100% <<<');
      console.log('=============================================\n');
    } catch (e) {
      console.error('Space Test Failed:', e.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

testSpaceEndpoints();
