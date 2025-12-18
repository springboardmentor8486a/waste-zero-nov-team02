const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
    skills: { type: [String], default: [] },

    googleId: { type: String, unique: true, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// ✅ CORRECT pre-save hook (NO next, NO try/catch)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.isGoogleUser) return;
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
