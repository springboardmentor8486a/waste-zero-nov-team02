const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ['volunteer', 'ngo', 'admin'],
      default: 'volunteer'
    },

    fullName: { type: String, trim: true },
    location: { type: String, trim: true },
    // Explicit address field matching schema requirements
    address: { type: String, trim: true },
    // Coordinates for map features
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    skills: { type: [String], default: [] },
    // Per-user settings persisted for cross-device preferences
    settings: {
      type: Object,
      default: {},
    },

    googleId: { type: String, unique: true, sparse: true },
    googleProfilePic: { type: String },
    avatar: { type: String }, // Unified avatar storage for all roles
    isGoogleUser: { type: Boolean, default: false },
    isGoogleUser: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },

    // Blocking functionality
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: null },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    blockedAt: { type: Date },

    // Activity tracking
    lastLogin: { type: Date, default: null },
    loginCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for NGO Profile
userSchema.virtual('ngoDetails', {
  ref: 'NgoProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Virtual for Volunteer Profile
userSchema.virtual('volunteerDetails', {
  ref: 'VolunteerProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// ✅ CORRECT pre-save hook (NO next, NO try/catch)
// Replace the existing pre‑save hook (lines 65‑68) with:
userSchema.pre('save', async function () {
  // If the user is a Google‑only account, skip password hashing
  if (this.isGoogleUser) return;

  // If the password field was not modified, do nothing
  if (!this.isModified('password')) return;

  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
