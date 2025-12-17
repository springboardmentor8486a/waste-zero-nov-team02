const crypto = require('crypto');

/**
 * Generate a secure 6-digit OTP
 * Uses cryptographically strong random values
 */
const generateOTP = () => {
  // Generates a random integer between 100000 and 999999
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
};

module.exports = generateOTP;
