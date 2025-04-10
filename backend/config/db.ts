import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';
const MAX_RETRIES = 5;

// Database connection function with retry logic
const connectDB = async (): Promise<void> => {
  let retryCount = 0;
  let connected = false;

  while (!connected && retryCount < MAX_RETRIES) {
    try {
      console.log(`Connecting to MongoDB... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      console.log('MongoDB URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));
      
      const conn = await mongoose.connect(MONGO_URI, {});
      connected = true;

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Show the list of connected databases
      const adminDb = conn.connection.db.admin();
      const dbInfo = await adminDb.listDatabases();
      console.log('Available databases:');
      dbInfo.databases.forEach((db: { name: string }) => {
        console.log(`- ${db.name}`);
      });
      
      // Check collections in the current database
      const collections = await conn.connection.db.listCollections().toArray();
      console.log('Collections in the current database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });

    } catch (error: any) {
      retryCount++;
      console.error(`MongoDB Connection Error (Attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);
      
      // More detailed error info
      if (error.name === 'MongoServerSelectionError') {
        console.error('Could not connect to any MongoDB server.');
        console.error('Please check that MongoDB is running and the connection string is correct.');
      }
      
      if (retryCount >= MAX_RETRIES) {
        console.error('Maximum connection attempts reached. Exiting process.');
        process.exit(1);
      } else {
        // Exponential backoff: wait longer between each retry
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
        console.log(`Retrying in ${backoffTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
};

export default connectDB;
