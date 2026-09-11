/**
 * Computes cosine similarity between two numerical vectors.
 * Formula: similarity(A, B) = (A · B) / (||A|| × ||B||)
 *
 * Handles:
 * - Non-array or empty vectors -> returns 0
 * - Mismatched vector dimensions -> returns 0
 * - Zero-magnitude vectors -> returns 0
 *
 * @param {number[]} vecA - First numerical vector
 * @param {number[]} vecB - Second numerical vector
 * @returns {number} Cosine similarity score between -1 and 1 (typically 0 to 1 for normalized embeddings)
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    return 0;
  }

  if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  // Avoid division by zero for zero-magnitude vectors
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

module.exports = cosineSimilarity;
