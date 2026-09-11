const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Lost item ID reference is required']
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Found item ID reference is required']
    },
    similarityScore: {
      type: Number,
      required: [true, 'Similarity score is required']
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate Match documents for the same lost/found pair
matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
