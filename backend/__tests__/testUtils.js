const mongoose = require('mongoose');
const logger = require('../services/logger');

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/chicha_store_test';

async function setupTestDatabase() {
  try {
    await mongoose.connect(MONGO_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to test database');
  } catch (error) {
    logger.error('Test database connection error', { error: error.message });
    throw error;
  }
}

async function teardownTestDatabase() {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    logger.info('Test database cleaned and connection closed');
  } catch (error) {
    logger.error('Test database teardown error', { error: error.message });
    throw error;
  }
}

module.exports = {
  setupTestDatabase,
  teardownTestDatabase
};
