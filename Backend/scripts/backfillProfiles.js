const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const NgoProfile = require('../models/NgoProfile');

dotenv.config();

async function backfillProfiles() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not defined');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find().lean();
    console.log(`📊 Found ${users.length} users to check`);

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      if (user.role === 'admin') {
        skipped++;
        continue;
      }

      if (user.role === 'volunteer') {
        const existing = await VolunteerProfile.findOne({ user: user._id });
        if (!existing) {
          await VolunteerProfile.create({
            user: user._id,
            displayName: user.fullName || user.username || 'Volunteer',
            avatar: user.googleProfilePic || 'no-photo.jpg'
          });
          console.log(`✅ Created volunteer profile for ${user.email}`);
          created++;
        } else {
          skipped++;
        }
      } else if (user.role === 'ngo') {
        const existing = await NgoProfile.findOne({ user: user._id });
        if (!existing) {
          await NgoProfile.create({
            user: user._id,
            organizationName: user.fullName || user.username || 'Organization',
            logo: user.googleProfilePic || 'no-photo.jpg'
          });
          console.log(`✅ Created NGO profile for ${user.email}`);
          created++;
        } else {
          skipped++;
        }
      }
    }

    console.log(`\n✅ Backfill complete!`);
    console.log(`   Created: ${created} profiles`);
    console.log(`   Skipped: ${skipped} (already exist or admin)`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error backfilling profiles:', error);
    process.exit(1);
  }
}

backfillProfiles();
