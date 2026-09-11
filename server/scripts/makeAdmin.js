/**
 * Controlled development script to promote an existing user to 'admin' role.
 *
 * Usage: node server/scripts/makeAdmin.js <user_email>
 * Example: node server/scripts/makeAdmin.js admin@college.edu
 *
 * Security:
 * - Does NOT expose passwords, password hashes, JWTs, Cloudinary secrets, or Gemini API keys.
 * - Used exclusively for development and administrative setup.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeAdmin() {
  const targetEmail = process.argv[2];

  if (!targetEmail || !targetEmail.trim()) {
    console.error('Error: Please provide a user email as an argument.');
    console.error('Usage: node server/scripts/makeAdmin.js <user_email>');
    process.exit(1);
  }

  const normalizedEmail = targetEmail.toLowerCase().trim();

  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not set in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.error(`User not found with email: ${normalizedEmail}`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`Success: User "${user.name}" (${user.email}) has been granted the "admin" role.`);
  } catch (error) {
    console.error('Failed to update user role:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();
