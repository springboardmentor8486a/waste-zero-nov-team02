// login_test.js - test admin login
const axios = require('axios');
(async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: '717823d156@kce.ac.in',
            password: 'Admin@123'
        });
        console.log('Response:', res.data);
    } catch (err) {
        if (err.response) {
            console.error('Error response:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
})();
