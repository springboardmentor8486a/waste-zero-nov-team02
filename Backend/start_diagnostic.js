const fs = require('fs');
const path = require('path');

const serverPath = path.resolve(__dirname, 'server.js');
console.log('Attempting to start server at:', serverPath);

if (fs.existsSync(serverPath)) {
    console.log('File exists. Starting script...');
    try {
        require('./server.js');
        console.log('Server module loaded successfully.');
    } catch (err) {
        console.error('CRITICAL STARTUP ERROR:', err.message);
        console.error('STACK:', err.stack);
    }
} else {
    console.error('ERORR: server.js not found at expected path.');
}
