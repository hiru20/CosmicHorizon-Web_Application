import dns from 'node:dns';
import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    let conn;
    try {
      conn = await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) {
      if (
        process.env.MONGODB_URI?.startsWith('mongodb+srv://') &&
        err.message?.includes('querySrv')
      ) {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        conn = await mongoose.connect(process.env.MONGODB_URI);
      } else {
        throw err;
      }
    }
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
