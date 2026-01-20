const nodemailer = require('nodemailer');

const sendEmail = async (email, options) => {
  try {
    // Check if email credentials exist
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('⚠️  Email Config Missing - SIMULATING EMAIL ⚠️');
      console.log(`📨  To: ${email}`);
      console.log(`SUBJECT: ${options.subject}`);
      return true; // Simulate success
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }


    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: options.subject || 'WasteZero Notification',
      html: options.html || `<p>${options.text}</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${email}`);
      return true;
    } catch (mailError) {
      console.error('❌ Failed to send real email:', mailError.message);
      console.log('⚠️  Falling back to SIMULATED EMAIL ⚠️');
      console.log(`📨  To: ${email}`);
      console.log(`SUBJECT: ${options.subject}`);
      return true;
    }
  } catch (error) {
    console.error('Error in sendEmail wrapper:', error);
    return false;
  }
};

const sendOTP = async (email, otp) => {
  return sendEmail(email, {
    subject: 'WasteZero - OTP Verification',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #065f46;">WasteZero OTP Verification</h2>
          <p>Your OTP for password reset is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #065f46; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
  });
};

module.exports = { sendOTP, sendEmail };


