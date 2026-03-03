const express = require('express');
const router = express.Router();
const { validateSignup, validateLogin } = require('../middleware/validator/userValidator');
const { signup, login, logout } = require('../controllers/authController');
const multer = require('multer');

// Configure multer to parse text-only multipart form data
const upload = multer();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', upload.none(), validateSignup, signup);

// @route   POST /api/auth/login
// @desc    Login user with email or phone
// @access  Public
router.post('/login', upload.none(), validateLogin, login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', logout);

module.exports = router;
