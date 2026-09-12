const mongoose = require('mongoose');
const Item = require('../models/Item');
const Match = require('../models/Match');
const cloudinary = require('../config/cloudinary');
const matchingService = require('../services/matchingService');
const { VALID_CATEGORIES } = require('../constants/categories');

const VALID_TYPES = ['lost', 'found'];
const VALID_STATUSES = ['active', 'matched', 'claimed', 'closed'];

/**
 * Validates that dateInput is a valid date and not in the future.
 * Uses calendar date semantics in IST and UTC to prevent UTC rollover rejection.
 */
function validateItemDate(dateInput) {
  if (!dateInput) {
    return { valid: false, message: 'Date is required.' };
  }

  const parsedDate = new Date(dateInput);
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, message: 'Invalid date provided.' };
  }

  const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const todayUTC = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(new Date());
  const maxAllowedDate = todayIST > todayUTC ? todayIST : todayUTC;

  let inputDateStr;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    inputDateStr = dateInput.substring(0, 10);
  } else {
    inputDateStr = parsedDate.toISOString().substring(0, 10);
  }

  if (inputDateStr > maxAllowedDate) {
    return { valid: false, message: 'Date cannot be in the future.' };
  }

  return { valid: true, parsedDate };
}

// @desc    Create a new lost/found item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date, imageUrl } = req.body;

    // Validate required fields (location and imageUrl are optional per business rules)
    if (!title || !description || !category || !type || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, type, date.'
      });
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const trimmedLocation = typeof location === 'string' ? location.trim() : '';

    // P1-3: Maximum text length limits
    if (trimmedTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 100 characters.'
      });
    }

    if (trimmedDescription.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 1000 characters.'
      });
    }

    if (trimmedLocation.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Location cannot exceed 100 characters.'
      });
    }

    // P1-4: Backend category validation
    if (!VALID_CATEGORIES.includes(trimmedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`
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

    // P1-1: Validate date and reject future dates
    const dateValidation = validateItemDate(date);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message
      });
    }
    const parsedDate = dateValidation.parsedDate;

    // Create item associated with authenticated user (imageUrl is optional)
    const item = await Item.create({
      title: trimmedTitle,
      description: trimmedDescription,
      category: trimmedCategory,
      type: normalizedType,
      location: trimmedLocation,
      date: parsedDate,
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
      userId: req.user._id
    });

    // Attempt AI semantic matching asynchronously without blocking or failing item creation
    matchingService.findPotentialMatches(item._id).catch((aiError) => {
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

    // Ownership/Admin check: item owner or admin can update the item
    const isOwner = item.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this item.'
      });
    }

    const { title, description, category, type, location, date, status, imageUrl } = req.body;

    // P1-2: Item type (Lost/Found) cannot be changed once created
    if (type !== undefined) {
      const normalizedType = type.toLowerCase().trim();
      if (normalizedType !== item.type) {
        return res.status(400).json({
          success: false,
          message: 'Item type (Lost/Found) cannot be changed once created. Please submit a new report.'
        });
      }
    }

    // P1-3: Maximum text length limits
    if (title !== undefined && title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 100 characters.'
      });
    }

    if (description !== undefined && description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 1000 characters.'
      });
    }

    if (location !== undefined && typeof location === 'string' && location.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Location cannot exceed 100 characters.'
      });
    }

    // P1-4: Backend category validation
    if (category !== undefined) {
      const trimmedCategory = typeof category === 'string' ? category.trim() : '';
      if (!VALID_CATEGORIES.includes(trimmedCategory)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`
        });
      }
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

    // P1-1: Validate date and reject future dates
    if (date !== undefined) {
      const dateValidation = validateItemDate(date);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.message
        });
      }
      item.date = dateValidation.parsedDate;
    }

    const oldTitle = item.title;
    const oldDesc = item.description;
    const oldCategory = item.category;
    const oldLocation = item.location;

    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (category !== undefined) item.category = category.trim();
    if (location !== undefined) item.location = typeof location === 'string' ? location.trim() : '';
    if (imageUrl !== undefined) item.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';

    const semanticFieldsChanged =
      (title !== undefined && item.title !== oldTitle) ||
      (description !== undefined && item.description !== oldDesc) ||
      (category !== undefined && item.category !== oldCategory) ||
      (location !== undefined && item.location !== oldLocation);

    // Do NOT allow changing userId (ownership cannot be reassigned)

    const updatedItem = await item.save();

    // P0-3: When an item's status changes to claimed or closed, delete all Match documents involving that item
    if (item.status === 'claimed' || item.status === 'closed') {
      await Match.deleteMany({
        $or: [
          { lostItemId: item._id },
          { foundItemId: item._id }
        ]
      });
    } else if (item.status === 'active' && semanticFieldsChanged) {
      // When an ACTIVE item changes any AI-relevant field (title, description, category, location),
      // re-run findPotentialMatches(item._id) non-blockingly so a Gemini failure does not fail update
      matchingService.findPotentialMatches(item._id).catch((aiError) => {
        console.warn(`[AI Rematching Warning] AI semantic matching could not be completed after update for item ${item._id}:`, aiError.message);
      });
    }

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

    // P0-4: Ensure all Match documents referencing this item are deleted
    await Match.deleteMany({
      $or: [
        { lostItemId: id },
        { foundItemId: id }
      ]
    });

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
