const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const NgoProfile = require('../models/NgoProfile');

dotenv.config();

async function fixRoleMismatches() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not defined');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find().lean();
    console.log(`📊 Found ${users.length} total users\n`);

    const mismatches = [];
    const toFix = [];

    for (const user of users) {
      if (user.role === 'admin') continue; // Skip admins

      const [volProfile, ngoProfile] = await Promise.all([
        VolunteerProfile.findOne({ user: user._id }),
        NgoProfile.findOne({ user: user._id })
      ]);

      const hasVolProfile = !!volProfile;
      const hasNgoProfile = !!ngoProfile;

      // Check for mismatches
      if (user.role === 'volunteer' && hasNgoProfile && !hasVolProfile) {
        mismatches.push({
          user,
          issue: 'Volunteer role but has NgoProfile only',
          fix: 'Remove NgoProfile, create VolunteerProfile',
          ngoProfileId: ngoProfile._id
        });
      } else if (user.role === 'ngo' && hasVolProfile && !hasNgoProfile) {
        mismatches.push({
          user,
          issue: 'NGO role but has VolunteerProfile only',
          fix: 'Remove VolunteerProfile, create NgoProfile',
          volProfileId: volProfile._id
        });
      } else if (user.role === 'volunteer' && hasNgoProfile) {
        mismatches.push({
          user,
          issue: 'Volunteer role but has NgoProfile (should not have it)',
          fix: 'Remove NgoProfile',
          ngoProfileId: ngoProfile._id
        });
      } else if (user.role === 'ngo' && hasVolProfile) {
        mismatches.push({
          user,
          issue: 'NGO role but has VolunteerProfile (should not have it)',
          fix: 'Remove VolunteerProfile',
          volProfileId: volProfile._id
        });
      }
    }

    if (mismatches.length > 0) {
      console.log(`⚠️  Found ${mismatches.length} role/profile mismatches:\n`);
      mismatches.forEach((m, idx) => {
        console.log(`${idx + 1}. ${m.user.email} (${m.user.username})`);
        console.log(`   Role: ${m.user.role}`);
        console.log(`   Issue: ${m.issue}`);
        console.log(`   Fix: ${m.fix}\n`);
      });

      console.log(`\n🧹 Fixing ${mismatches.length} mismatches...\n`);

      for (const mismatch of mismatches) {
        try {
          if (mismatch.ngoProfileId) {
            await NgoProfile.findByIdAndDelete(mismatch.ngoProfileId);
            console.log(`✅ Removed NgoProfile for ${mismatch.user.email}`);
            
            // Create correct profile if missing
            if (mismatch.user.role === 'volunteer') {
              const existing = await VolunteerProfile.findOne({ user: mismatch.user._id });
              if (!existing) {
                await VolunteerProfile.create({
                  user: mismatch.user._id,
                  displayName: mismatch.user.fullName || mismatch.user.username,
                  avatar: 'no-photo.jpg'
                });
                console.log(`✅ Created VolunteerProfile for ${mismatch.user.email}`);
              }
            }
          }
          
          if (mismatch.volProfileId) {
            await VolunteerProfile.findByIdAndDelete(mismatch.volProfileId);
            console.log(`✅ Removed VolunteerProfile for ${mismatch.user.email}`);
            
            // Create correct profile if missing
            if (mismatch.user.role === 'ngo') {
              const existing = await NgoProfile.findOne({ user: mismatch.user._id });
              if (!existing) {
                await NgoProfile.create({
                  user: mismatch.user._id,
                  organizationName: mismatch.user.fullName || mismatch.user.username,
                  logo: 'no-photo.jpg'
                });
                console.log(`✅ Created NgoProfile for ${mismatch.user.email}`);
              }
            }
          }
        } catch (err) {
          console.error(`❌ Failed to fix ${mismatch.user.email}:`, err.message);
        }
      }
    } else {
      console.log('✅ No role/profile mismatches found. All users are correctly configured!');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing mismatches:', error);
    process.exit(1);
  }
}

fixRoleMismatches();
