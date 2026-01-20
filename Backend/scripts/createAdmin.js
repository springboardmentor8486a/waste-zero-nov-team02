const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const ADMIN_EMAIL = '717823d156@kce.ac.in';
const ADMIN_PASSWORD = 'Admin@123'; // Default password - should be changed after first login
const ADMIN_USERNAME = 'admin_kce';

async function createAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not defined');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('✅ Admin account already exists with admin role');
        // Update password and ensure it's not a Google-only user
        existingAdmin.isGoogleUser = false;
        existingAdmin.password = ADMIN_PASSWORD;
        // Force save by marking password as modified
        existingAdmin.markModified('password');
        await existingAdmin.save();
        console.log('✅ Admin password updated and Google user flag removed');
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        existingAdmin.isGoogleUser = false;
        existingAdmin.password = ADMIN_PASSWORD;
        existingAdmin.markModified('password');
        await existingAdmin.save();
        console.log('✅ Existing user updated to admin role');
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const admin = await User.create({
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
        fullName: 'Admin User',
        isEmailVerified: true
      });
      console.log('✅ Admin account created successfully');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log('⚠️  Please change the password after first login!');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
