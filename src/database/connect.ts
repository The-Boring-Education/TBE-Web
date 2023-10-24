import mongoose from 'mongoose';
import { MONGODB_URI } from '@/constant';

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connectToDatabase;
