// Quick test script to check MongoDB connection and list collections
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB Atlas...');
console.log('📍 Connection string:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas successfully!\n');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await mongoose.connection.db.admin().listDatabases();
    
    console.log('📊 Available databases:');
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check wastezero database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📁 Collections in "wastezero" database:');
    if (collections.length === 0) {
      console.log('   ⚠️  No collections found. Database will be created when first data is inserted.');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Count documents in users collection
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`\n👥 Users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().select('email username role createdAt').limit(5);
      console.log('\n📋 Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.username}) - ${user.role}`);
      });
    } else {
      console.log('\n💡 Tip: Register a user through your app to see data here!');
    }
    
    // Count OTPs
    const OTP = require('./models/OTP');
    const otpCount = await OTP.countDocuments();
    console.log(`\n🔐 OTPs in database: ${otpCount}`);
    
    mongoose.connection.close();
    console.log('\n✅ Connection test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check your MONGODB_URI in .env file');
    console.error('2. Verify IP is whitelisted in MongoDB Atlas');
    console.error('3. Check username and password are correct');
    process.exit(1);
  });

