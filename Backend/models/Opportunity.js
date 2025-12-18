const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  short: { type: String },
  description: { type: String },
  date: { type: String },
  time: { type: String },
  endTime: { type: String },
  location: { type: String },
  category: { type: String },
  volunteers: { type: String },
  cover: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
