const mongoose = require('mongoose');
const Item = require('../models/Item');
const Match = require('../models/Match');
const { findPotentialMatches } = require('../services/matchingService');

// @desc    Get AI potential matches for a specific item
// @route   GET /api/matches/:itemId
// @access  Private (Owner only)
const getItemMatches = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format.'
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Security / Ownership Verification (Amendment 1)
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view matches for this item.'
      });
    }

    // Generate / recalculate potential matches
    const matches = await findPotentialMatches(item._id);

    return res.status(200).json({
      success: true,
      itemId: item._id,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Get item matches error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error generating potential matches.'
    });
  }
};

// @desc    Get potential matches for all active items owned by authenticated user (Dashboard)
// @route   GET /api/matches
// @access  Private
const getMyMatches = async (req, res) => {
  try {
    // 1. Find all active items owned by authenticated user
    const userActiveItems = await Item.find({
      userId: req.user._id,
      status: 'active'
    });

    if (userActiveItems.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        matches: []
      });
    }

    const userItemIds = userActiveItems.map((item) => item._id);

    // 2. Query Match documents involving user's active items
    const rawMatches = await Match.find({
      $or: [
        { lostItemId: { $in: userItemIds } },
        { foundItemId: { $in: userItemIds } }
      ]
    })
      .populate('lostItemId')
      .populate('foundItemId')
      .sort({ similarityScore: -1 });

    // 3. Format results clearly for the dashboard
    const formattedMatches = [];

    for (const m of rawMatches) {
      if (!m.lostItemId || !m.foundItemId) continue;

      const isLostUserItem = userItemIds.some((id) => id.equals(m.lostItemId._id));
      const sourceItem = isLostUserItem ? m.lostItemId : m.foundItemId;
      const matchedItem = isLostUserItem ? m.foundItemId : m.lostItemId;

      // Only include if both items are active
      if (sourceItem.status === 'active' && matchedItem.status === 'active') {
        formattedMatches.push({
          _id: m._id,
          sourceItem: {
            _id: sourceItem._id,
            title: sourceItem.title,
            type: sourceItem.type
          },
          matchedItem: {
            _id: matchedItem._id,
            title: matchedItem.title,
            description: matchedItem.description,
            category: matchedItem.category,
            type: matchedItem.type,
            location: matchedItem.location,
            date: matchedItem.date,
            imageUrl: matchedItem.imageUrl || '',
            status: matchedItem.status
          },
          similarityScore: m.similarityScore,
          similarityPercentage: Math.round(m.similarityScore * 100)
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches
    });
  } catch (error) {
    console.error('Get my matches error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your potential matches.'
    });
  }
};

module.exports = {
  getItemMatches,
  getMyMatches
};
