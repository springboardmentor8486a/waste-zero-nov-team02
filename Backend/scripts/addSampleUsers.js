const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const NgoProfile = require('../models/NgoProfile');
const bcrypt = require('bcryptjs');

dotenv.config();

const volunteers = [
    { username: 'volunteer1', email: 'volunteer1@gmail.com', fullName: 'John Doe', skills: ['Composting', 'Recycling'] },
    { username: 'volunteer2', email: 'volunteer2@gmail.com', fullName: 'Jane Smith', skills: ['Web Development', 'Education'] },
    { username: 'volunteer3', email: 'volunteer3@gmail.com', fullName: 'Mike Johnson', skills: ['Driver', 'Social Media'] },
    { username: 'volunteer4', email: 'volunteer4@gmail.com', fullName: 'Sarah Williams', skills: ['Data Entry', 'Marketing'] },
    { username: 'volunteer5', email: 'volunteer5@gmail.com', fullName: 'David Brown', skills: ['Composting', 'Web Development'] },
    { username: 'volunteer6', email: 'volunteer6@gmail.com', fullName: 'Emily Davis', skills: ['Education', 'Social Media'] },
    { username: 'volunteer7', email: 'volunteer7@gmail.com', fullName: 'Chris Wilson', skills: ['Driver', 'Recycling'] },
    { username: 'volunteer8', email: 'volunteer8@gmail.com', fullName: 'Lisa Anderson', skills: ['Marketing', 'Data Entry'] },
    { username: 'volunteer9', email: 'volunteer9@gmail.com', fullName: 'Robert Taylor', skills: ['Composting', 'Education'] },
    { username: 'volunteer10', email: 'volunteer10@gmail.com', fullName: 'Amanda Martinez', skills: ['Web Development', 'Social Media'] },
    { username: 'volunteer11', email: 'volunteer11@gmail.com', fullName: 'James Garcia', skills: ['Driver', 'Marketing'] },
    { username: 'volunteer12', email: 'volunteer12@gmail.com', fullName: 'Michelle Lee', skills: ['Recycling', 'Data Entry'] },
    { username: 'volunteer13', email: 'volunteer13@gmail.com', fullName: 'Daniel White', skills: ['Composting', 'Web Development'] },
    { username: 'volunteer14', email: 'volunteer14@gmail.com', fullName: 'Jennifer Harris', skills: ['Education', 'Social Media'] },
    { username: 'volunteer15', email: 'volunteer15@gmail.com', fullName: 'Matthew Clark', skills: ['Driver', 'Recycling'] }
];

const ngos = [
    { username: 'ngo1', email: 'ngo1@example.org', fullName: 'Green Earth Foundation', orgName: 'Green Earth Foundation', city: 'New York', website: 'https://www.greenearth.org', mission: 'Protecting our planet for future generations' },
    { username: 'ngo2', email: 'ngo2@example.org', fullName: 'Eco Warriors', orgName: 'Eco Warriors', city: 'Los Angeles', website: 'https://www.ecowarriors.org', mission: 'Fighting for environmental justice' },
    { username: 'ngo3', email: 'ngo3@example.org', fullName: 'Clean Water Initiative', orgName: 'Clean Water Initiative', city: 'Chicago', website: 'https://www.cleanwater.org', mission: 'Ensuring access to clean water for all' },
    { username: 'ngo4', email: 'ngo4@example.org', fullName: 'Sustainable Future', orgName: 'Sustainable Future', city: 'Houston', website: 'https://www.sustainablefuture.org', mission: 'Building a sustainable tomorrow' },
    { username: 'ngo5', email: 'ngo5@example.org', fullName: 'Wildlife Protection', orgName: 'Wildlife Protection', city: 'Phoenix', website: 'https://www.wildlifeprotection.org', mission: 'Protecting endangered species' },
    { username: 'ngo6', email: 'ngo6@example.org', fullName: 'Ocean Guardians', orgName: 'Ocean Guardians', city: 'Philadelphia', website: 'https://www.oceanguardians.org', mission: 'Saving our oceans' },
    { username: 'ngo7', email: 'ngo7@example.org', fullName: 'Forest Keepers', orgName: 'Forest Keepers', city: 'San Antonio', website: 'https://www.forestkeepers.org', mission: 'Preserving forest ecosystems' },
    { username: 'ngo8', email: 'ngo8@example.org', fullName: 'Climate Action Now', orgName: 'Climate Action Now', city: 'San Diego', website: 'https://www.climateaction.org', mission: 'Taking immediate climate action' },
    { username: 'ngo9', email: 'ngo9@example.org', fullName: 'Renewable Energy Hub', orgName: 'Renewable Energy Hub', city: 'Dallas', website: 'https://www.renewablehub.org', mission: 'Promoting renewable energy solutions' },
    { username: 'ngo10', email: 'ngo10@example.org', fullName: 'Zero Waste Alliance', orgName: 'Zero Waste Alliance', city: 'San Jose', website: 'https://www.zerowaste.org', mission: 'Achieving zero waste communities' }
];

async function addSampleUsers() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI not defined in .env file');
            process.exit(1);
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Add Volunteers
        console.log('\n📝 Adding 15 volunteers...');
        let volunteerCount = 0;
        for (const vol of volunteers) {
            const existing = await User.findOne({ email: vol.email });
            if (!existing) {
                const hashedPassword = await bcrypt.hash('Password123!', 10);
                const user = await User.create({
                    email: vol.email,
                    username: vol.username,
                    password: hashedPassword,
                    role: 'volunteer',
                    fullName: vol.fullName,
                    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random login within last 30 days
                });

                await VolunteerProfile.create({
                    user: user._id,
                    displayName: vol.fullName,
                    skills: vol.skills,
                    totalPoints: Math.floor(Math.random() * 100),
                    avatar: 'no-photo.jpg'
                });
                volunteerCount++;
                console.log(`  ✅ Created volunteer: ${vol.username}`);
            } else {
                console.log(`  ⚠️  Volunteer ${vol.username} already exists, skipping...`);
            }
        }

        // Add NGOs
        console.log('\n📝 Adding 10 NGOs...');
        let ngoCount = 0;
        for (const ngo of ngos) {
            const existing = await User.findOne({ email: ngo.email });
            if (!existing) {
                const hashedPassword = await bcrypt.hash('Password123!', 10);
                const user = await User.create({
                    email: ngo.email,
                    username: ngo.username,
                    password: hashedPassword,
                    role: 'ngo',
                    fullName: ngo.fullName,
                    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random login within last 30 days
                });

                await NgoProfile.create({
                    user: user._id,
                    organizationName: ngo.orgName,
                    city: ngo.city,
                    website: ngo.website,
                    missionStatement: ngo.mission,
                    logo: 'no-photo.jpg'
                });
                ngoCount++;
                console.log(`  ✅ Created NGO: ${ngo.username}`);
            } else {
                console.log(`  ⚠️  NGO ${ngo.username} already exists, skipping...`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ SUMMARY');
        console.log('='.repeat(50));
        console.log(`Volunteers created: ${volunteerCount}/15`);
        console.log(`NGOs created: ${ngoCount}/10`);
        console.log('='.repeat(50));
        console.log('\n📝 Default password for all users: Password123!');
        console.log('⚠️  Users should change their password after first login!\n');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding sample users:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

addSampleUsers();

