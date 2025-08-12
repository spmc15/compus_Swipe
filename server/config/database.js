import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    // For WebContainer environment, use memory database
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-swipe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@college.edu' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@college.edu',
        password: 'admin123',
        college: 'Campus Swipe College',
        collegeDomain: 'college.edu',
        role: 'admin',
        isEmailVerified: true
      });
      console.log('Default admin user created: admin@college.edu / admin123');
    }
    
    // Also create a demo user
    const userExists = await User.findOne({ email: 'user@college.edu' });
    if (!userExists) {
      await User.create({
        name: 'Demo User',
        email: 'user@college.edu',
        password: 'demo123',
        college: 'Campus Swipe College',
        collegeDomain: 'college.edu',
        role: 'user',
        isEmailVerified: true
      });
      console.log('Default demo user created: user@college.edu / demo123');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
};
export default connectDB;