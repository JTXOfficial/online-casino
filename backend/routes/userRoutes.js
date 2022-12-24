const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.get('/user/:userId', UserController.getUser);

router.get('/register', UserController.createUser);

router.get('/login', UserController.loginUser);

module.exports = router;