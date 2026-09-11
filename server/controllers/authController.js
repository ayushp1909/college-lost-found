const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.'
      });
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.'
      });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (store only passwordHash, never plain password)
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student'
    });

    // Return safe user information (excluding passwordHash)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user by email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password with bcryptjs
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Ensure JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Configuration Error] JWT_SECRET is not set in environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET is not defined.'
      });
    }

    // Generate JWT containing user id and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Return token and safe user information
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private (Requires JWT)
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile.'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
