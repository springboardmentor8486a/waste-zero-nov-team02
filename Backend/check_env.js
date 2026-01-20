// Quick diagnostic script to check if environment variables are loaded
require('dotenv').config();

console.log('=== Environment Variables Check ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('===================================');

if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: No AI API keys found!');
    console.error('Make sure .env file exists and has OPENROUTER_API_KEY or GEMINI_API_KEY');
} else {
    console.log('✅ SUCCESS: At least one AI API key is configured!');
    if (process.env.OPENROUTER_API_KEY) {
        console.log('✅ OpenRouter API key found');
    }
    if (process.env.GEMINI_API_KEY) {
        console.log('✅ Gemini API key found');
    }
}
