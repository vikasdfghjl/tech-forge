import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);

    const connectWithRetry = () => {
      mongoose.connect(mongoUri)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => {
          console.error('Failed to connect to MongoDB:', err);
          setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
        });
    };

    connectWithRetry();

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
