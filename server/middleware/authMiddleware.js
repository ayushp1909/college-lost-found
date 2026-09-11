const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for presence of Bearer token in Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('[Configuration Error] JWT_SECRET is not set in environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET is not defined.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // Attach safe user details without passwordHash
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Authorization denied.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication middleware'
    });
  }
};

module.exports = authMiddleware;
