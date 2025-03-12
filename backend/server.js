const express = require('express');
const dotenv = require('dotenv');
var cors = require('cors');
const http = require ('http');
const socketIO = require('socket.io');
const { connectDB } = require('./config/FileDatabase'); // Use file database instead of MongoDB
const userRoutes = require ('./routes/userRoutes')
const authRoutes = require('./routes/auth'); // Import auth routes
const bodyParser = require("body-parser");
const session = require('express-session'); // session middleware
const passportLocal = require("passport-local").Strategy;
const passport = require('passport');  // authentication
const User = require('./model/FileUser'); // Use file-based User model
const Bet = require('./model/FileBets'); // Use file-based Bets model
const passportConfig = require('./passportConfig');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const httpServer = http.createServer(app);

// Configure Socket.IO with improved CORS and connection settings
const socketServer = socketIO(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000
});

// Log socket server events
socketServer.on('connection', (socket) => {
  console.log('Socket.IO server: Client connected with ID:', socket.id);
  
  socket.on('disconnect', (reason) => {
    console.log('Socket.IO server: Client disconnected:', socket.id, reason);
  });
  
  socket.on('error', (error) => {
    console.error('Socket.IO server: Socket error:', error);
  });
});

socketServer.on('connect_error', (error) => {
  console.error('Socket.IO server: Connection error:', error);
});

// Configure CORS for Express
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));

// Parse JSON requests
app.use(express.json({
  extended: false
}));

// Serve static files from the public directory
app.use('/uploads', express.static('public/uploads'));

// Set up session middleware
app.use(session({
  secret: 'r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// Connect to database
connectDB();

// Clear existing bets on startup
User.removeActiveBets(function(){
  console.log('Cleared user bets');
  Bet.removeActiveBets();
});

// Set up API routes
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);

// Initialize roulette game
const roulette = require('./data/roulette')(socketServer);

// Export the app and httpServer for app.js to use
module.exports = { app, httpServer };

