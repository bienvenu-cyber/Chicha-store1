// Global test setup
require('dotenv').config({ path: '.env.test' });

// Mock external dependencies
jest.mock('./backend/services/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  logRequest: jest.fn()
}));

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  throw reason;
});

// Timeout for async tests
jest.setTimeout(10000);
