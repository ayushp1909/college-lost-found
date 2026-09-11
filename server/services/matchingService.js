const Item = require('../models/Item');
const Match = require('../models/Match');
const cosineSimilarity = require('../utils/cosineSimilarity');
const { prepareItemText, generateEmbedding } = require('./embeddingService');

const DEFAULT_THRESHOLD = 0.80;
const TOP_K = 5;

/**
 * AI Semantic Matching Service.
 *
 * NOTE FOR COLLEGE PROJECT VIVA / ACADEMIC REVIEW:
 * This implementation uses candidate-by-candidate Google Gemini text embeddings (gemini-embedding-001)
 * and in-memory mathematical cosine similarity. This approach is lightweight, beginner-friendly,
 * and directly suited for the small-to-medium dataset of a campus Lost & Found system without
 * the operational overhead of vector databases (Pinecone/Milvus), ANN search, or Redis queues.
 *
 * @param {string|mongoose.Types.ObjectId} itemId - Target item ID
 * @returns {Promise<Array>} Ranked potential matches (max 5)
 */
async function findPotentialMatches(itemId) {
  // 1. Load target item
  const targetItem = await Item.findById(itemId);
  if (!targetItem) {
    throw new Error('Target item not found.');
  }

  // 2. Prepare target text & generate its 768-dimensional embedding
  const targetText = prepareItemText(targetItem);
  if (!targetText) {
    return [];
  }

  const targetEmbedding = await generateEmbedding(targetText);

  // 3. Retrieve active items of the OPPOSITE type
  // lost <-> found
  const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

  const candidates = await Item.find({
    type: oppositeType,
    status: 'active',
    _id: { $ne: targetItem._id }
  }).populate('userId', 'name');

  if (candidates.length === 0) {
    // Clean up any existing matches if there are no candidates
    await Match.deleteMany({
      $or: [
        { lostItemId: targetItem._id },
        { foundItemId: targetItem._id }
      ]
    });
    return [];
  }

  // 4. Configurable similarity threshold
  const threshold = process.env.AI_MATCH_THRESHOLD
    ? parseFloat(process.env.AI_MATCH_THRESHOLD)
    : DEFAULT_THRESHOLD;

  // 5. Compare candidates candidate-by-candidate
  const scoredCandidates = [];

  for (const candidate of candidates) {
    try {
      const candidateText = prepareItemText(candidate);
      if (!candidateText) continue;

      const candidateEmbedding = await generateEmbedding(candidateText);
      const score = cosineSimilarity(targetEmbedding, candidateEmbedding);

      // Only include candidates at or above the threshold
      if (score >= threshold) {
        scoredCandidates.push({
          matchedItem: candidate,
          similarityScore: parseFloat(score.toFixed(4)),
          similarityPercentage: Math.round(score * 100)
        });
      }
    } catch (candidateError) {
      console.warn(`[Matching Warning] Failed candidate embedding for item ${candidate._id}:`, candidateError.message);
      // Continue evaluating other candidates
    }
  }

  // 6. Sort candidates by similarity score descending and pick TOP_K (max 5)
  scoredCandidates.sort((a, b) => b.similarityScore - a.similarityScore);
  const topMatches = scoredCandidates.slice(0, TOP_K);

  // 7. Store / Upsert qualifying matches into MongoDB Match collection
  const qualifyingOppositeIds = [];

  for (const match of topMatches) {
    const lostItemId = targetItem.type === 'lost' ? targetItem._id : match.matchedItem._id;
    const foundItemId = targetItem.type === 'found' ? targetItem._id : match.matchedItem._id;

    qualifyingOppositeIds.push(match.matchedItem._id);

    // Upsert avoids duplicate records and updates score if recalculated
    await Match.findOneAndUpdate(
      { lostItemId, foundItemId },
      {
        similarityScore: match.similarityScore,
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 8. Stale Match Cleanup:
  // Remove existing matches involving targetItem that are no longer in the qualifying top matches
  await Match.deleteMany({
    $or: [
      { lostItemId: targetItem._id, foundItemId: { $nin: qualifyingOppositeIds } },
      { foundItemId: targetItem._id, lostItemId: { $nin: qualifyingOppositeIds } }
    ]
  });

  return topMatches;
}

module.exports = {
  findPotentialMatches,
  DEFAULT_THRESHOLD,
  TOP_K
};
