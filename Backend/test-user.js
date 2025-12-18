const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check existing users
    const existingCount = await User.countDocuments();
    console.log(`📊 Current users in database: ${existingCount}`);

    // Create a test user
    const testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'test123456',
      role: 'volunteer',
      fullName: 'Test User',
      location: 'Test Location',
      skills: ['Testing', 'Development']
    });
    
    await testUser.save();

    console.log('✅ Test user created successfully!');
    console.log('📝 User details:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   ID: ${testUser._id}`);

    // Verify it's in database
    const count = await User.countDocuments();
    console.log(`\n📊 Total users now: ${count}`);

    await mongoose.connection.close();
    console.log('\n✅ Connection closed. Check MongoDB Atlas now!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();

