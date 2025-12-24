require('dotenv').config();
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  try {
    // Find docs missing ngo_id but having createdBy
    const filter = { $or: [{ ngo_id: { $exists: false } }, { ngo_id: null }], createdBy: { $exists: true, $ne: null } };
    const docs = await Opportunity.find(filter).lean();
    if (!docs.length) {
      console.log('No opportunities require migration');
      process.exit(0);
    }

    console.log(`Found ${docs.length} documents to migrate.`);
    let updated = 0;
    for (const d of docs) {
      await Opportunity.updateOne({ _id: d._id }, { $set: { ngo_id: d.createdBy } });
      updated++;
    }

    console.log(`Migration complete. Updated ${updated} documents.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(2);
  }
}

main();
