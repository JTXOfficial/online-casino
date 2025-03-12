// This file serves as a bridge between bin/www and server.js
// It imports the Express app and HTTP server from server.js and exports them for bin/www to use

// Import the Express app and HTTP server from server.js
const { app, httpServer } = require('./server');

// Export both the app and httpServer for bin/www to use
module.exports = { app, httpServer }; 