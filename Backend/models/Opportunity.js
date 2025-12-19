<<<<<<< HEAD
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
=======
const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    required_skills: {
      type: [String],
      default: [],
    },

    duration: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed", "in-progress"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);
>>>>>>> 1650e40257e0b4ec1a4810b8567af1802cea50e0
