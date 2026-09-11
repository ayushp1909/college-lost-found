const express = require('express');
const router = express.Router();

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemImage
} = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadSingleImage = require('../middleware/uploadMiddleware');

// All item routes require authentication
router.use(authMiddleware);

// Upload item image
router.post('/upload-image', uploadSingleImage, uploadItemImage);

router.route('/')
  .post(createItem)
  .get(getItems);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
