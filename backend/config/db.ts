import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

// Database connection function
const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));
    
    const conn = await mongoose.connect(MONGO_URI, {    });

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
    console.error(`MongoDB Connection Error: ${error.message}`);
    // More detailed error info
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server.');
      console.error('Please check that MongoDB is running and the connection string is correct.');
    }
    process.exit(1);
  }
};

export default connectDB;
