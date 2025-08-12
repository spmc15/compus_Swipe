import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // For WebContainer environment, use memory database
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-swipe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;