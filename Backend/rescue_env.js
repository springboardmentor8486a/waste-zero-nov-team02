require('dotenv').config();

console.log('---RESCUE START---');
console.log('MONGODB_URI=' + (process.env.MONGODB_URI || 'MISSING'));
console.log('JWT_SECRET=' + (process.env.JWT_SECRET || 'MISSING'));
console.log('GOOGLE_CLIENT_ID=' + (process.env.GOOGLE_CLIENT_ID || 'MISSING'));
console.log('GOOGLE_CLIENT_SECRET=' + (process.env.GOOGLE_CLIENT_SECRET || 'MISSING'));
console.log('GOOGLE_REDIRECT_URI=' + (process.env.GOOGLE_REDIRECT_URI || 'MISSING'));
console.log('EMAIL_USER=' + (process.env.EMAIL_USER || 'MISSING'));
console.log('EMAIL_PASS=' + (process.env.EMAIL_PASS || 'MISSING'));
console.log('PORT=5000');
console.log('---RESCUE END---');
