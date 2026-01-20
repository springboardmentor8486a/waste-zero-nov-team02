const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const NgoProfile = require('../models/NgoProfile');

dotenv.config();

async function checkAndCleanDuplicates() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not defined');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find().lean();
    console.log(`📊 Found ${users.length} total users`);

    const issues = [];
    const toRemove = [];

    for (const user of users) {
      // Check if user has both volunteer and ngo profiles
      const [volProfile, ngoProfile] = await Promise.all([
        VolunteerProfile.findOne({ user: user._id }),
        NgoProfile.findOne({ user: user._id })
      ]);

      if (volProfile && ngoProfile) {
        issues.push({
          userId: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          hasVolProfile: true,
          hasNgoProfile: true,
          issue: 'Has both VolunteerProfile and NgoProfile'
        });

        // Determine which profile to keep based on user's current role
        if (user.role === 'volunteer') {
          // Remove NGO profile
          toRemove.push({
            userId: user._id,
            email: user.email,
            action: 'Remove NgoProfile',
            profileId: ngoProfile._id
          });
        } else if (user.role === 'ngo') {
          // Remove Volunteer profile
          toRemove.push({
            userId: user._id,
            email: user.email,
            action: 'Remove VolunteerProfile',
            profileId: volProfile._id
          });
        } else {
          // Admin or unknown role - remove both profiles or keep based on email domain
          const domain = user.email?.split('@')[1] || '';
          const shouldBeVolunteer = /gmail/i.test(domain);
          
          if (shouldBeVolunteer) {
            toRemove.push({
              userId: user._id,
              email: user.email,
              action: 'Remove NgoProfile (email suggests volunteer)',
              profileId: ngoProfile._id
            });
          } else {
            toRemove.push({
              userId: user._id,
              email: user.email,
              action: 'Remove VolunteerProfile (email suggests NGO)',
              profileId: volProfile._id
            });
          }
        }
      }
    }

    console.log(`\n🔍 Found ${issues.length} users with conflicting profiles:\n`);
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.email} (${issue.username})`);
      console.log(`   Role: ${issue.role}`);
      console.log(`   Issue: ${issue.issue}`);
    });

    if (toRemove.length > 0) {
      console.log(`\n🧹 Cleaning up ${toRemove.length} duplicate profiles...\n`);
      
      for (const item of toRemove) {
        try {
          if (item.action.includes('NgoProfile')) {
            await NgoProfile.findByIdAndDelete(item.profileId);
            console.log(`✅ Removed NgoProfile for ${item.email}`);
          } else if (item.action.includes('VolunteerProfile')) {
            await VolunteerProfile.findByIdAndDelete(item.profileId);
            console.log(`✅ Removed VolunteerProfile for ${item.email}`);
          }
        } catch (err) {
          console.error(`❌ Failed to remove profile for ${item.email}:`, err.message);
        }
      }
    } else {
      console.log('\n✅ No duplicate profiles found. All users are clean!');
    }

    // Also check for duplicate emails (same email with different roles)
    console.log('\n🔍 Checking for duplicate emails...\n');
    const emailGroups = {};
    users.forEach(u => {
      if (!emailGroups[u.email]) {
        emailGroups[u.email] = [];
      }
      emailGroups[u.email].push(u);
    });

    const duplicateEmails = Object.entries(emailGroups).filter(([email, users]) => users.length > 1);
    
    if (duplicateEmails.length > 0) {
      console.log(`⚠️  Found ${duplicateEmails.length} emails with multiple accounts:\n`);
      duplicateEmails.forEach(([email, userList]) => {
        console.log(`   ${email}:`);
        userList.forEach(u => {
          console.log(`     - ${u.username} (${u.role}) - ID: ${u._id}`);
        });
      });
    } else {
      console.log('✅ No duplicate emails found.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    process.exit(1);
  }
}

checkAndCleanDuplicates();
