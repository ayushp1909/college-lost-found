const { GoogleGenAI } = require('@google/genai');

/**
 * Prepares a concise text representation of an item for embedding generation.
 * Combines meaningful fields: title, description, category, and location.
 *
 * @param {Object} item - Item document or object
 * @returns {string} Combined text
 */
function prepareItemText(item) {
  if (!item) return '';

  const parts = [
    item.title?.trim(),
    item.description?.trim(),
    item.category ? `Category: ${item.category.trim()}` : null,
    item.location ? `Location: ${item.location.trim()}` : null
  ].filter(Boolean);

  return parts.join('. ');
}

/**
 * Generates a 768-dimensional text embedding vector using Google Gemini gemini-embedding-001.
 *
 * @param {string} text - Input text to embed
 * @returns {Promise<number[]>} 768-dimensional embedding vector
 */
async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Server configuration error: GEMINI_API_KEY is not configured in environment variables.');
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Invalid input: text to embed cannot be empty.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text.trim(),
    config: {
      outputDimensionality: 768
    }
  });

  // Extract embedding values from SDK response
  const values = response.embedding?.values || response.embeddings?.[0]?.values;

  if (!values || !Array.isArray(values) || values.length === 0) {
    throw new Error('Failed to extract numerical embedding vector from Gemini response.');
  }

  return values;
}

module.exports = {
  prepareItemText,
  generateEmbedding
};
