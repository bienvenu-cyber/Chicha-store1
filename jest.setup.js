import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global mocks
jest.mock('./backend/services/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  logRequest: jest.fn()
}));

// Global imports for tests
global.express = express;
global.mongoose = mongoose;
global.jwt = jwt;

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  throw reason;
});

// Timeout for async tests
jest.setTimeout(10000);
