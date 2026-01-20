// test_temp_admin.js - test temp admin login
require('dotenv').config();
const axios = require('axios');

(async () => {
    try {
        const API_URL = process.env.API_URL || 'http://localhost:5000';
        console.log(`Testing login at ${API_URL}/api/auth/login`);
        console.log('Email: tempadmin@wastezero.com');
        console.log('Password: TempAdmin123!\n');
        
        const res = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'tempadmin@wastezero.com',
            password: 'TempAdmin123!'
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error('❌ Login failed:', err.response.data);
            console.error('Status:', err.response.status);
        } else {
            console.error('❌ Error:', err.message);
        }
    }
})();

