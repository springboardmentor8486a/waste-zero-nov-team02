// Direct test script for registration
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function testRegister() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔵 Testing User.create()...');
    const user = await User.create({
      email: 'directtest@example.com',
      username: 'directtestuser',
      password: 'test123456',
      role: 'volunteer'
    });
    
    console.log('✅ USER CREATED SUCCESSFULLY!');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Role:', user.role);
    console.log('   Password (hashed):', user.password ? 'Yes' : 'No');
    
    // Verify it's in database
    const found = await User.findById(user._id);
    console.log('\n✅ Verified in database:', found ? 'YES' : 'NO');
    
    if (found) {
      console.log('   Found user:', found.email);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Error details:', error);
    if (error.code === 11000) {
      console.error('Duplicate key error - user already exists');
    }
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.values(error.errors).forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

testRegister();

