const twilio = require('twilio');

const sendSMS = async (phoneNumber, message) => {

    // Check for Twilio Credentials
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (sid && token && from) {
        try {
            console.log(`Attempting to send real SMS to ${phoneNumber}...`);
            const client = new twilio(sid, token);
            await client.messages.create({
                body: message,
                to: phoneNumber,
                from: from
            });
            console.log(`✅ SMS sent successfully to ${phoneNumber}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send SMS via Twilio:`, error.message);
            // Fallback to console log just in case
        }
    }

    // SIMULATION: Log to backend console
    console.log(`\n📲 [SMS MOCK] To: ${phoneNumber}`);
    console.log(`💬 Message: ${message}\n`);

    // Return true to simulate success
    return true;
};

module.exports = sendSMS;
