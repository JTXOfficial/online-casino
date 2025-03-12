const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Database file paths
const DB_DIR = path.join(__dirname, '../data/db');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const BETS_FILE = path.join(DB_DIR, 'bets.json');
const ROUNDS_FILE = path.join(DB_DIR, 'rounds.json');

// Initialize database files if they don't exist
const initializeDB = () => {
  try {
    // Create DB directory if it doesn't exist
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Initialize users file if it doesn't exist
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }

    // Initialize bets file if it doesn't exist
    if (!fs.existsSync(BETS_FILE)) {
      fs.writeFileSync(BETS_FILE, JSON.stringify([]));
    }

    // Initialize rounds file if it doesn't exist
    if (!fs.existsSync(ROUNDS_FILE)) {
      fs.writeFileSync(ROUNDS_FILE, JSON.stringify([]));
    }

    console.log('File database initialized');
    return true;
  } catch (err) {
    console.error('Error initializing database:', err.message);
    return false;
  }
};

// Generate a unique ID (similar to MongoDB ObjectId)
const generateId = () => {
  return crypto.randomBytes(12).toString('hex');
};

// Read data from a file
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading from ${filePath}:`, err.message);
    return [];
  }
};

// Write data to a file
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err.message);
    return false;
  }
};

// Database connection function (for compatibility with the existing code)
const connectDB = async () => {
  try {
    const initialized = initializeDB();
    if (initialized) {
      console.log('File database is connected');
    } else {
      throw new Error('Failed to initialize file database');
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Export the database functions
module.exports = {
  connectDB,
  generateId,
  readData,
  writeData,
  USERS_FILE,
  BETS_FILE,
  ROUNDS_FILE
}; 