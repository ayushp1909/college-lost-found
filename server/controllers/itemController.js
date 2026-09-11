const mongoose = require('mongoose');
const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');
const { findPotentialMatches } = require('../services/matchingService');

const VALID_TYPES = ['lost', 'found'];
const VALID_STATUSES = ['active', 'matched', 'claimed', 'closed'];

// @desc    Create a new lost/found item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date, imageUrl } = req.body;

    // Validate required fields
    if (!title || !description || !category || !type || !location || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, type, location, date.'
      });
    }

    // Validate item type
    const normalizedType = type.toLowerCase().trim();
    if (!VALID_TYPES.includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "lost" or "found".'
      });
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date provided.'
      });
    }

    // Create item associated with authenticated user (imageUrl is optional)
    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      type: normalizedType,
      location: location.trim(),
      date: parsedDate,
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
      userId: req.user._id
    });

    // Attempt AI semantic matching asynchronously without blocking or failing item creation
    findPotentialMatches(item._id).catch((aiError) => {
      console.warn(`[AI Matching Notice] AI semantic matching could not be completed for item ${item._id}:`, aiError.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Item created successfully.',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating item.'
    });
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving items.'
    });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format.'
      });
    }

    const item = await Item.findById(id).populate('userId', 'name');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    return res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving item.'
    });
  }
};

// @desc    Update an item (Owner only)
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format.'
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Ownership check: only the user who created the item can update it
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this item.'
      });
    }

    const { title, description, category, type, location, date, status, imageUrl } = req.body;

    // Validate type if provided
    if (type !== undefined) {
      const normalizedType = type.toLowerCase().trim();
      if (!VALID_TYPES.includes(normalizedType)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "lost" or "found".'
        });
      }
      item.type = normalizedType;
    }

    // Validate status if provided
    if (status !== undefined) {
      const normalizedStatus = status.toLowerCase().trim();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be active, matched, claimed, or closed.'
        });
      }
      item.status = normalizedStatus;
    }

    // Validate date if provided
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date provided.'
        });
      }
      item.date = parsedDate;
    }

    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (category !== undefined) item.category = category.trim();
    if (location !== undefined) item.location = location.trim();
    if (imageUrl !== undefined) item.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';

    // Do NOT allow changing userId (ownership cannot be reassigned)

    const updatedItem = await item.save();

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully.',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating item.'
    });
  }
};

// @desc    Delete an item (Owner only)
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format.'
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Ownership check: only the user who created the item can delete it
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this item.'
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Item deleted successfully.'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting item.'
    });
  }
};

// @desc    Upload item image to Cloudinary
// @route   POST /api/items/upload-image
// @access  Private
const uploadItemImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload.'
      });
    }

    // Check Cloudinary environment configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('[Configuration Error] Cloudinary credentials missing in environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Cloudinary credentials are not configured.'
      });
    }

    // Stream image buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'college-lost-found',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image to Cloudinary.'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully.',
          imageUrl: result.secure_url
        });
      }
    );

    uploadStream.on('error', (streamError) => {
      console.error('Cloudinary stream error:', streamError);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Error during image streaming to Cloudinary.'
        });
      }
    });

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload item image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing image upload.'
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemImage
};
