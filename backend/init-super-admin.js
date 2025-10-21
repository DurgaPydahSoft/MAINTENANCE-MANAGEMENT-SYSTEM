const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const createSuperAdmin = async () => {
  try {
    // Check if super admin exists
    const superAdmin = await User.findOne({ role: 'super_admin' });
    
    if (superAdmin) {
      console.log('Super Admin already exists');
      process.exit(0);
    }

    // Create super admin
    const user = new User({
      email: 'superadmin@college.com',
      password: 'Admin@123',
      name: 'Super Admin',
      role: 'super_admin'
    });

    await user.save();
    console.log('Super Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();