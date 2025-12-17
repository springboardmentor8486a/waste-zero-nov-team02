const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },

    otp: {
      type: String,
      required: true
    },

    // Exact expiry timestamp (used by TTL index)
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // 🔥 MongoDB TTL uses this field directly
    },

    used: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt properly
  }
);

// Compound index for fast OTP verification
otpSchema.index({
  email: 1,
  otp: 1,
  used: 1,
  expiresAt: 1
});

module.exports = mongoose.model('OTP', otpSchema);
