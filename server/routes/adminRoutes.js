const express = require('express');
const router = express.Router();

const {
  getStats,
  getUsers,
  getAllItems,
  deleteItem
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes strictly require authentication then admin authorization
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin Routes
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/items', getAllItems);
router.delete('/items/:id', deleteItem);

module.exports = router;
