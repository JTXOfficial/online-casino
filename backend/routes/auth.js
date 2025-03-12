const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/FileUser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profile-pictures');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

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

// @route   PUT /api/auth/users/:id
// @desc    Update user profile
// @access  Private
router.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, email } = req.body;

  console.log(`Updating user ${userId} with:`, req.body);

  try {
    // Check if user exists
    const user = User.findById(userId);
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Found user:`, user);
    
    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = User.findOne({ username });
      if (existingUser && existingUser._id !== userId) {
        console.log(`Username ${username} already taken by another user`);
        return res.status(400).json({ message: 'Username already exists' });
      }
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingEmail = User.findOne({ email });
      if (existingEmail && existingEmail._id !== userId) {
        console.log(`Email ${email} already taken by another user`);
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Update user data
    if (username) user.username = username;
    if (email) user.email = email;
    
    console.log(`Updating user with data:`, user);
    
    // Save updated user
    User.updateUser(user, (err) => {
      if (err) {
        console.error(`Error updating user:`, err);
        return res.status(500).json({ message: 'Failed to update user' });
      }
      
      // Calculate user balance
      User.calculateBalance(userId, (balance) => {
        // Return updated user data
        const responseData = {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: balance
        };
        
        console.log(`Sending updated user data:`, responseData);
        res.json(responseData);
      });
    });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-password
// @desc    Verify user password
// @access  Private
router.post('/verify-password', async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: 'User ID and password are required' });
  }

  try {
    // Find the user
    const user = User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Password is valid
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Password verification error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/users/:id/password
// @desc    Update user password
// @access  Private
router.put('/users/:id/password', async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    // Find the user
    const user = User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    
    // Save updated user
    User.updatePassword(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update password' });
      }
      
      res.json({ message: 'Password updated successfully' });
    });
  } catch (err) {
    console.error('Password update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/users/:id/profile-picture
// @desc    Upload user profile picture
// @access  Private
router.post('/users/:id/profile-picture', upload.single('profilePicture'), async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Check if user exists
    const user = User.findById(userId);
    
    if (!user) {
      // Delete the uploaded file if user not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user already has a profile picture, delete the old one
    if (user.profilePicture) {
      const oldPicturePath = path.join('public/uploads', user.profilePicture.replace('/uploads/', ''));
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }
    
    // Update user with new profile picture URL
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    user.profilePicture = profilePictureUrl;
    
    // Save updated user
    User.updateUser(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update profile picture' });
      }
      
      res.json({ 
        message: 'Profile picture updated successfully',
        profilePicture: profilePictureUrl
      });
    });
  } catch (err) {
    console.error('Profile picture upload error:', err.message);
    
    // Delete the uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 