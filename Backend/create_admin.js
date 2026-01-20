// create_admin.js - script to create an admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not set in .env');
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const email = '717823d156@kce.ac.in';
        const password = 'Admin@123';
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Admin user already exists. Updating password...');
            existing.password = password;
            existing.role = 'admin';
            existing.isGoogleUser = false;
            await existing.save();
            console.log('✅ Admin user updated');
        } else {
            const adminUser = new User({
                email,
                username: 'admin',
                password,
                role: 'admin',
                fullName: 'Admin User',
                isGoogleUser: false,
            });
            await adminUser.save();
            console.log('✅ Admin user created');
        }
    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
})();
