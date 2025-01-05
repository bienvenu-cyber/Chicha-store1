import { authService } from '../services/authService';
import jwt_decode from 'jwt-decode';

// Mock jwt-decode
jest.mock('jwt-decode');

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('isTokenValid returns false for missing token', () => {
    expect(authService.isTokenValid()).toBe(false);
  });

  test('isTokenValid returns false for expired token', () => {
    const mockDecodeToken = jwt_decode as jest.MockedFunction<typeof jwt_decode>;
    mockDecodeToken.mockReturnValue({ 
      exp: Math.floor(Date.now() / 1000) - 3600 // Token expiré il y a une heure
    });

    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.'; 
    localStorage.setItem('admin_token', expiredToken);
    
    expect(authService.isTokenValid()).toBe(false);
  });

  test('isTokenValid returns true for valid token', () => {
    const mockDecodeToken = jwt_decode as jest.MockedFunction<typeof jwt_decode>;
    mockDecodeToken.mockReturnValue({ 
      exp: Math.floor(Date.now() / 1000) + 3600 // Token valide pour une heure
    });

    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.'; 
    localStorage.setItem('admin_token', validToken);
    
    expect(authService.isTokenValid()).toBe(true);
  });

  test('logout clears localStorage', () => {
    localStorage.setItem('admin_token', 'dummy-token');
    localStorage.setItem('admin_user', '{"name":"test"}');
    
    authService.logout();
    
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(localStorage.getItem('admin_user')).toBeNull();
  });

  test('setToken stores token in localStorage', () => {
    const testToken = 'test-token';
    const testUser = { id: '123', name: 'Test User' };

    authService.setToken(testToken, testUser);

    expect(localStorage.getItem('admin_token')).toBe(testToken);
    expect(localStorage.getItem('admin_user')).toBe(JSON.stringify(testUser));
  });

  test('getToken retrieves token from localStorage', () => {
    const testToken = 'retrieve-token';
    localStorage.setItem('admin_token', testToken);

    expect(authService.getToken()).toBe(testToken);
  });
});
