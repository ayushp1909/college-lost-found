const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Type is required (lost or found)'],
      enum: {
        values: ['lost', 'found'],
        message: 'Type must be either "lost" or "found"'
      }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'matched', 'claimed', 'closed'],
        message: 'Status must be active, matched, claimed, or closed'
      },
      default: 'active'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required']
    }
  },
  {
    timestamps: true
  }
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
