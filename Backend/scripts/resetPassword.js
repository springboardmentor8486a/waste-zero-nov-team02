require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const email = argv.email || argv.e;
  const password = argv.password || argv.p;

  if (!email || !password) {
    console.error('Usage: node resetPassword.js --email user@example.com --password NewPass123');
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  // Connect with default options (modern mongoose/mongodb driver no longer accepts
  // `useNewUrlParser` / `useUnifiedTopology` flags).
  await mongoose.connect(MONGODB_URI);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for', email);
      process.exit(2);
    }

    user.password = password;
    await user.save();
    console.log('Password updated for', email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(3);
  }
}

main();
