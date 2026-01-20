
const mongoose = require('mongoose');

// Consolidated Opportunity schema used by both plural and singular routes.
// Contains fields expected by the frontend (`createdBy`) and NGO/admin routes (`ngo_id`, `status`, `required_skills`).
const OpportunitySchema = new mongoose.Schema(
  {
    // If created by a regular user (frontend), `createdBy` tracks the author.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // If created by an NGO/admin flow, `ngo_id` will be populated.
    ngo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    title: { type: String, required: true, trim: true },
    short: { type: String },
    description: { type: String },

    // Scheduling fields (optional)
    date: { type: String },
    time: { type: String },
    endTime: { type: String },

    // Location and category
    location: { type: String },
    category: { type: String },

    // Additional NGO fields
    required_skills: { type: [String], default: [] },
    duration: { type: String },
    // Maximum number of volunteers required for this opportunity
    capacity: { type: Number, default: null },
    // Number of volunteers who have registered/applied (counts pending/accepted)
    registered_count: { type: Number, default: 0 },
    // Cover image path (URL or relative path)
    cover: { type: String },
    // Additional attached files (paths)
    attachments: { type: [String], default: [] },
    // Legacy field (kept for compatibility) - optional display string
    volunteers: { type: String },

    status: { type: String, enum: ['open', 'closed', 'in-progress'], default: 'open' },
  },
  { timestamps: true }
);

// Indexes to support common queries
OpportunitySchema.index({ ngo_id: 1 });
OpportunitySchema.index({ status: 1 });
OpportunitySchema.index({ location: 'text', title: 'text', short: 'text', description: 'text' });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
