const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Match = require('../models/Match');

// @desc    Get system-wide summary statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalItems,
      lostItems,
      foundItems,
      activeItems,
      matchedItems,
      claimedItems,
      closedItems
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'active' }),
      Item.countDocuments({ status: 'matched' }),
      Item.countDocuments({ status: 'claimed' }),
      Item.countDocuments({ status: 'closed' })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalItems,
        lostItems,
        foundItems,
        activeItems,
        matchedItems,
        claimedItems,
        closedItems
      }
    });
  } catch (error) {
    console.error('Admin getStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin statistics.'
    });
  }
};

// @desc    Get all users (safe metadata, never passwordHash)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('_id name email role createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users.'
    });
  }
};

// @desc    Get all campus items
// @route   GET /api/admin/items
// @access  Private/Admin
const getAllItems = async (req, res) => {
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
    console.error('Admin getAllItems error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving all items.'
    });
  }
};

// @desc    Admin delete any item and remove associated matches
// @route   DELETE /api/admin/items/:id
// @access  Private/Admin
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

    // Delete item document
    await item.deleteOne();

    // Mandatory Addition: Remove all Match documents referencing this item
    await Match.deleteMany({
      $or: [
        { lostItemId: id },
        { foundItemId: id }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Item and associated matches deleted successfully.'
    });
  } catch (error) {
    console.error('Admin deleteItem error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting item.'
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  getAllItems,
  deleteItem
};
