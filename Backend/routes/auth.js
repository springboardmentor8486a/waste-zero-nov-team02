const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const NgoProfile = require('../models/NgoProfile');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../utils/sendOTP');
const protect = require('../middleware/auth');
const AdminLog = require('../models/AdminLog');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER
router.post('/register', async (req, res) => {
  try {

    const { email, username, password, confirmPassword } = req.body;

    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      // Check if user is blocked
      if (existingUser.isBlocked && existingUser.email === email) {
        return res.status(403).json({
          success: false,
          message: `Your email has been blocked. Reason: ${existingUser.blockedReason || 'No reason provided'}. Please contact support for assistance.`
        });
      }
      const message = existingUser.email === email ? 'Email already exists' : 'Username already exists';
      return res.status(400).json({ success: false, message });
    }

    // Derive role from email domain: any domain containing 'gmail' -> volunteer, others -> ngo
    const domain = String(email).split('@')[1] || '';
    const derivedRole = /gmail/i.test(domain) ? 'volunteer' : 'ngo';

    // Server-side validation: if client provided a `role`, ensure it matches derived role.
    // This prevents clients from overriding role to gain elevated access during registration.
    if (req.body.role && String(req.body.role) !== String(derivedRole)) {
      return res.status(400).json({ success: false, message: `Role mismatch: detected '${derivedRole}' from email domain; cannot override to '${req.body.role}'.` });
    }

    const user = await User.create({ email, username, password, role: derivedRole, fullName: username });

    // Auto-create profile based on role
    if (derivedRole === 'volunteer') {
      await VolunteerProfile.create({
        user: user._id,
        displayName: username,
        avatar: 'no-photo.jpg'
      });
    } else if (derivedRole === 'ngo') {
      await NgoProfile.create({
        user: user._id,
        organizationName: username,
        logo: 'no-photo.jpg'
      });
    }

    // Notify all admins about new registration
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        recipient: admin._id,
        sender: user._id,
        type: 'new_registration',
        message: `New ${derivedRole} registered: ${username}`,
        isRead: false
      }));
      await Notification.insertMany(notifications);
    }

    // Create Admin Log for registration
    await AdminLog.create({
      action: 'USER_REGISTERED',
      performedBy: user._id,
      targetUser: user._id,
      details: `New user registration via Email: ${username} (${derivedRole})`
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Username'} already exists`
      });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Your account has been blocked. Reason: ${user.blockedReason || 'No reason provided'}. Please contact support for assistance.`
      });
    }

    // ALLOW Google users to login with password if they have reset it/set one.
    // We only rely on password comparison below.
    // if (user.isGoogleUser) { ... } -> REMOVED strict check

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login timestamp and login count
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateToken(user._id);

    let userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      location: user.location,
      skills: user.skills
    };

    // Fetch Profile Details
    if (user.role === 'ngo') {
      const ngoProfile = await NgoProfile.findOne({ user: user._id });
      userData.ngoDetails = ngoProfile;
    } else if (user.role === 'volunteer') {
      const volProfile = await VolunteerProfile.findOne({ user: user._id });
      userData.volunteerDetails = volProfile;
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GOOGLE AUTH
router.post('/google', async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const googleId = payload?.sub;
    const googleProfilePic = payload?.picture;

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: 'Invalid Google token payload' });
    }

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: `Your account has been blocked. Reason: ${user.blockedReason || 'No reason provided'}. Please contact support for assistance.`
        });
      }

      // Update Google profile info even for existing users
      user.googleId = googleId;
      user.googleProfilePic = googleProfilePic;
      user.isGoogleUser = true;
      user.isEmailVerified = true;
      user.lastLogin = new Date(); // Update last login
      user.loginCount = (user.loginCount || 0) + 1; // Increment login count
      await user.save();

      const token = generateToken(user._id);

      // Fetch Profile Details
      let userData = user.toObject();
      if (user.role === 'ngo') {
        const ngoProfile = await NgoProfile.findOne({ user: user._id });
        userData.ngoDetails = ngoProfile;
      } else if (user.role === 'volunteer') {
        const volProfile = await VolunteerProfile.findOne({ user: user._id });
        userData.volunteerDetails = volProfile;
      }

      return res.json({ success: true, message: 'Login successful', token, user: userData });
    }

    // Before creating new user, check if there's a blocked user with this email
    const blockedUser = await User.findOne({ email, isBlocked: true });
    if (blockedUser) {
      return res.status(403).json({
        success: false,
        message: `Your email has been blocked. Reason: ${blockedUser.blockedReason || 'No reason provided'}. Please contact support for assistance.`
      });
    }

    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    // Derive role from email domain for Google signups as well
    const domain = String(email).split('@')[1] || '';
    const derivedRole = /gmail/i.test(domain) ? 'volunteer' : 'ngo';

    user = await User.create({
      email,
      username,
      googleId,
      googleProfilePic,
      isGoogleUser: true,
      isEmailVerified: true,
      fullName: name || username,
      role: derivedRole,
      lastLogin: new Date(), // Set initial last login for new users
      loginCount: 1 // First login
    });

    // Auto-create profile based on role
    if (derivedRole === 'volunteer') {
      await VolunteerProfile.create({
        user: user._id,
        displayName: name || username,
        avatar: googleProfilePic || 'no-photo.jpg'
      });
    } else if (derivedRole === 'ngo') {
      await NgoProfile.create({
        user: user._id,
        organizationName: name || username,
        logo: googleProfilePic || 'no-photo.jpg'
      });
    }

    // Notify all admins about new registration
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const notificationsArr = admins.map(admin => ({
        recipient: admin._id,
        sender: user._id,
        type: 'new_registration',
        message: `New Google ${derivedRole} registered: ${user.username}`,
        isRead: false
      }));
      await Notification.insertMany(notificationsArr);
    }

    // Create Admin Log for Google registration
    await AdminLog.create({
      action: 'GOOGLE_REGISTERED',
      performedBy: user._id,
      targetUser: user._id,
      details: `New user registration via Google: ${user.username} (${derivedRole})`
    });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Account created successfully', token, user });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// FORGOT PASSWORD - send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({ email, otp, expiresAt });

    const sent = await sendOTP(email, otp);
    console.log(`[AUTH] Forgot Password: OTP generated for ${email}: ${otp}. Sent: ${sent}`);
    if (!sent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const query = {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      used: false,
      expiresAt: { $gt: new Date() }
    };

    console.log(`[AUTH] Verifying OTP with query:`, JSON.stringify(query));

    const otpRecord = await OTP.findOne(query);

    if (!otpRecord) {
      const lastRec = await OTP.findOne({ email: query.email }).sort({ createdAt: -1 });
      console.log(`[AUTH] OTP Not Found. Last record for ${query.email}:`, lastRec ? `OTP:${lastRec.otp}, Used:${lastRec.used}, Expired:${lastRec.expiresAt < new Date()}` : 'None');
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    console.log(`[AUTH] OTP Verified successfully for ${email}`);

    // otpRecord.used = true; // Don't consume yet, wait for password reset
    // await otpRecord.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const otpRecord = await OTP.findOne({
      email,
      otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    otpRecord.used = true;
    await otpRecord.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CURRENT USER
router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
