const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/FileUser');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    User.findOne({ username }, (err, existingUser) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Check if email already exists
      User.findOne({ email }, (err, existingEmail) => {
        if (err) {
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        
        // Hash password
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return res.status(500).json({ message: 'Server error' });
          }
          
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              return res.status(500).json({ message: 'Server error' });
            }
            
            // Create new user
            const newUser = new User({
              username,
              email,
              password: hash,
              balance: 1000, // Give new users 1000 starting balance
              bets: []
            });
            
            // Save user
            newUser.save((err) => {
              if (err) {
                return res.status(500).json({ message: 'Failed to save user' });
              }
              
              res.status(201).json({ message: 'Registration successful!' });
            });
          });
        });
      });
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    User.findOne({ username }, (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Calculate user balance
        User.calculateBalance(user._id, (balance) => {
          // Return user data
          res.json({
            id: user._id,
            username: user.username,
            balance: balance
          });
        });
      });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/user
// @desc    Get user data by ID
// @access  Public
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  
  try {
    const user = User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate user balance
    User.calculateBalance(userId, (balance) => {
      // Return user data
      res.json({
        id: user._id,
        username: user.username,
        balance: balance
      });
    });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 