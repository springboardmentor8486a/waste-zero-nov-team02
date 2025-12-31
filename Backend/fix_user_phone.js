const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        // Try standard naming conventions
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("Missing MONGO_URI or MONGODB_URI in .env");
        }

        console.log("Using URI starting with:", uri.substring(0, 15) + "...");
        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Connection error:', err);
        process.exit(1);
    }
};

const fixUser = async () => {
    await connectDB();

    const email = 'aneeshsrinivas2006@gmail.com';
    // Use digits format
    const phoneNumber = '917483760641';

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found with email:', email);
        } else {
            console.log('Found user:', user.username, 'Current Phone:', user.phoneNumber);
            user.phoneNumber = phoneNumber;
            await user.save();
            console.log('✅ Successfully updated phone number to:', phoneNumber);

            // Verify regex match simulation
            const suffix = phoneNumber.slice(-10);
            console.log('Suffix for regex:', suffix);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
    process.exit();
};

fixUser();
