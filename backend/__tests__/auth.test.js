const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn(),
      ip: '127.0.0.1'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    mockNext = jest.fn();
  });

  test('auth middleware should reject request without token', async () => {
    mockReq.header.mockReturnValue(null);
    
    await auth(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('adminAuth middleware should reject non-admin users', async () => {
    const nonAdminUser = { role: 'user' };
    mockReq.user = nonAdminUser;
    
    await adminAuth(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
