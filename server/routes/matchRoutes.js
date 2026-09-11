const express = require('express');
const router = express.Router();

const { getItemMatches, getMyMatches } = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');

// All match routes require authentication
router.use(authMiddleware);

// Get potential matches for all active items owned by the authenticated user (Dashboard)
router.get('/', getMyMatches);

// Get potential matches for a specific item (Owner only)
router.get('/:itemId', getItemMatches);

module.exports = router;
