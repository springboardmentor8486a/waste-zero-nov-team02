const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

// Temporary admin credentials
const TEMP_ADMIN_EMAIL = 'tempadmin@wastezero.com';
const TEMP_ADMIN_PASSWORD = 'TempAdmin123!';
const TEMP_ADMIN_USERNAME = 'temp_admin';

async function resetAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if temp admin already exists
    let admin = await User.findOne({ email: TEMP_ADMIN_EMAIL });
    
    if (admin) {
      console.log('📝 Updating existing temp admin account...');
      // Hash password manually to ensure it works
      const hashedPassword = await bcrypt.hash(TEMP_ADMIN_PASSWORD, 10);
      // Update existing admin
      admin.role = 'admin';
      admin.isGoogleUser = false;
      admin.password = hashedPassword;
      admin.fullName = 'Temporary Admin';
      admin.isEmailVerified = true;
      admin.isBlocked = false;
      // Skip the pre-save hook by updating directly
      await User.updateOne(
        { _id: admin._id },
        {
          $set: {
            role: 'admin',
            isGoogleUser: false,
            password: hashedPassword,
            fullName: 'Temporary Admin',
            isEmailVerified: true,
            isBlocked: false
          }
        }
      );
      console.log('✅ Temp admin account updated successfully');
    } else {
      console.log('📝 Creating new temp admin account...');
      // Hash password manually
      const hashedPassword = await bcrypt.hash(TEMP_ADMIN_PASSWORD, 10);
      // Create new admin user
      admin = await User.create({
        email: TEMP_ADMIN_EMAIL,
        username: TEMP_ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
        fullName: 'Temporary Admin',
        isEmailVerified: true,
        isGoogleUser: false
      });
      console.log('✅ Temp admin account created successfully');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🔑 TEMPORARY ADMIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log(`Email: ${TEMP_ADMIN_EMAIL}`);
    console.log(`Password: ${TEMP_ADMIN_PASSWORD}`);
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANT: This is a temporary account. Please change the password after login!');
    console.log('='.repeat(50) + '\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetAdmin();

