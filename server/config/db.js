const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('[Database] Warning: MONGO_URI is not set in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
  }
};

module.exports = connectDB;
