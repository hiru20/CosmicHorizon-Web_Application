import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Favorite from './src/models/Favorite.js';
import Watchlist from './src/models/Watchlist.js';

const seedDemoData = async () => {
  try {
    await connectDB();

    const demoEmail = 'astronaut@cosmichorizon.space';
    const demoPassword = 'MissionControl2026!';

    // Remove existing demo user if exists to reset fresh state
    const existing = await User.findOne({ email: demoEmail });
    if (existing) {
      await Favorite.deleteMany({ user: existing._id });
      await Watchlist.deleteMany({ user: existing._id });
      await User.deleteOne({ _id: existing._id });
      console.log('[Seeder] Cleared previous demo user data.');
    }

    // Create Demo Astronaut User
    const demoUser = await User.create({
      name: 'Commander Alex Vance',
      email: demoEmail,
      password: demoPassword,
      bio: 'Astrophysics Researcher & Orbital Flight Commander. Tracking ISS telemetry and upcoming deep space missions.',
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
    });

    console.log(`[Seeder] Created demo user: ${demoUser.email} (Password: ${demoPassword})`);

    // Add Demo Favorites
    await Favorite.create([
      {
        user: demoUser._id,
        itemType: 'apod',
        itemId: '2026-10-08',
        title: 'The Pillars of Creation in Deep Infrared',
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600',
        description: 'Star-forming pillars of cold interstellar gas and dust stand tall in the Eagle Nebula (M16), captured here with unprecedented clarity.',
      },
      {
        user: demoUser._id,
        itemType: 'mars',
        itemId: '102685',
        title: 'Perseverance Rover - Sol 1000 (FHAZ)',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        description: 'Martian surface geological formations captured by Front Hazard Avoidance Camera.',
      },
    ]);

    // Add Demo Watchlist Launches
    await Watchlist.create([
      {
        user: demoUser._id,
        launchId: 'launch-001',
        launchName: 'Falcon 9 Block 5 | Starlink Group 7-18',
        launchDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
        agency: 'SpaceX',
        rocket: 'Falcon 9 Block 5',
        padLocation: 'Space Launch Complex 40, Cape Canaveral, FL',
        status: 'Go',
        image: 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800',
      },
      {
        user: demoUser._id,
        launchId: 'launch-002',
        launchName: 'Atlas V 551 | KuiperSat Mission 1',
        launchDate: new Date(Date.now() + 1000 * 60 * 60 * 74).toISOString(),
        agency: 'United Launch Alliance (ULA)',
        rocket: 'Atlas V 551',
        padLocation: 'Space Launch Complex 41, Cape Canaveral, FL',
        status: 'Go',
        image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800',
      },
    ]);

    console.log('[Seeder] Successfully seeded demo favorites and watchlist missions!');
    console.log('\n======================================================');
    console.log('DEMO CREDENTIALS FOR VIVA DEMONSTRATION:');
    console.log('Email:    astronaut@cosmichorizon.space');
    console.log('Password: MissionControl2026!');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDemoData();
