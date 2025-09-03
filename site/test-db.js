// test-db.js
require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env.local file.');
  process.exit(1);
}

async function testConnection() {
  console.log('Attempting to connect to MongoDB...');
  console.log(`Using URI: ${MONGO_URI.replace(/:([^:@\/?]+)@/, ':****@')}`); // Hides password

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connection successful!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Connection closed.');
    process.exit();
  }
}

testConnection();