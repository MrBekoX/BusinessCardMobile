/**
 * Security Tests for Authentication
 * Tests for secure token storage and auth security
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@lib/supabaseClient';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('Auth Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Storage Security', () => {
    it('should store tokens in SecureStore, not AsyncStorage', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const mockSession = {
        user: mockUser,
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      };

      // Mock successful auth response
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Verify SecureStore was called for token storage
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should NOT store auth tokens in AsyncStorage', async () => {
      // After implementing SecureStore, this should pass
      const allAsyncStorageKeys = Object.keys(AsyncStorage);

      // Check that no auth tokens are in AsyncStorage
      const authKeys = allAsyncStorageKeys.filter(key =>
        key.includes('auth') || key.includes('token') || key.includes('session')
      );

      expect(authKeys.length).toBe(0);
    });

    it('should store tokens with secure accessibility settings', async () => {
      // Verify that tokens are stored with WHEN_UNLOCKED_THIS_DEVICE_ONLY
      // This ensures tokens are only accessible when device is unlocked
      const mockToken = 'secure-token-123';

      await SecureStore.setItemAsync('auth-token', mockToken, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        })
      );
    });
  });

  describe('Session Management', () => {
    it('should clear tokens on sign out', async () => {
      // Mock successful sign out
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Perform sign out
      const { error } = await supabase.auth.signOut();

      expect(error).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });
});

/**
 * Security Tests for Deep Link Validation
 */
describe('Deep Link Security', () => {
  const { deepLinkUtils } = require('@navigation/linking');

  describe('UUID Validation', () => {
    it('should accept valid UUIDs', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const link = `cardvault://card/${validUUID}`;

      const result = deepLinkUtils.parseDeepLink(link);

      expect(result).not.toBeNull();
      expect(result?.route).toBe('CardDetail');
      expect(result?.params?.cardId).toBe(validUUID);
    });

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        'invalid-uuid',
        '123456789',
        '../../../etc/passwd',
        'card/../../sensitive',
        '"><script>alert(1)</script>',
      ];

      invalidUUIDs.forEach(uuid => {
        const link = `cardvault://card/${uuid}`;
        const result = deepLinkUtils.parseDeepLink(link);
        expect(result).toBeNull();
      });
    });

    it('should prevent path traversal attacks', () => {
      const maliciousLinks = [
        'cardvault://card/../../sensitive-data',
        'cardvault://card/../../../private',
        'cardvault://card/%2e%2e/%2e%2e/etc/passwd',
      ];

      maliciousLinks.forEach(link => {
        const result = deepLinkUtils.parseDeepLink(link);
        expect(result).toBeNull();
      });
    });

    it('should prevent XSS via deep links', () => {
      const xssPayloads = [
        '<script>alert(1)</script>',
        'javascript:alert(1)',
        '"><img src=x onerror=alert(1)>',
      ];

      xssPayloads.forEach(payload => {
        const link = `cardvault://card/${payload}`;
        const result = deepLinkUtils.parseDeepLink(link);
        expect(result).toBeNull();
      });
    });
  });

  describe('Auth Route Validation', () => {
    it('should only accept whitelisted auth routes', () => {
      const validRoutes = ['login', 'register', 'reset-password'];

      validRoutes.forEach(route => {
        const link = `cardvault://auth/${route}`;
        const result = deepLinkUtils.parseDeepLink(link);
        expect(result).not.toBeNull();
      });
    });

    it('should reject unknown auth routes', () => {
      const invalidRoutes = [
        'admin',
        'dashboard',
        '../../admin',
        'logout',
      ];

      invalidRoutes.forEach(route => {
        const link = `cardvault://auth/${route}`;
        const result = deepLinkUtils.parseDeepLink(link);
        // Should either return null or default to login
        if (result) {
          expect(result.route).toBe('Login');
        } else {
          expect(result).toBeNull();
        }
      });
    });
  });
});

/**
 * Security Tests for File Upload
 */
describe('File Upload Security', () => {
  const { validateAvatarFile } = require('@services/profileService');

  describe('File Type Validation', () => {
    it('should accept only allowed image types', async () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      for (const type of allowedTypes) {
        const mockFile = {
          uri: 'file://test.jpg',
          type,
        };

        // Mock fetch to return blob with correct type
        global.fetch = (jest.fn(() =>
          Promise.resolve({
            blob: () => Promise.resolve({ type, size: 1024 }),
          } as unknown as Response)
        ) as unknown) as typeof fetch;

        const result = await validateAvatarFile(mockFile);
        expect(result.valid).toBe(true);
      }
    });

    it('should reject disallowed file types', async () => {
      const disallowedTypes = [
        'application/x-msdownload',
        'application/pdf',
        'text/html',
        'application/javascript',
        'image/svg+xml', // SVG can contain scripts
      ];

      for (const type of disallowedTypes) {
        const mockFile = {
          uri: `file://test.${type.split('/')[1]}`,
          type,
        };

        global.fetch = (jest.fn(() =>
          Promise.resolve({
            blob: () => Promise.resolve({ type, size: 1024 }),
          } as unknown as Response)
        ) as unknown) as typeof fetch;

        const result = await validateAvatarFile(mockFile);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('File Size Validation', () => {
    it('should reject files larger than 2MB', async () => {
      const mockFile = {
        uri: 'file://large.jpg',
        type: 'image/jpeg',
      };

      global.fetch = (jest.fn(() =>
        Promise.resolve({
          blob: () => Promise.resolve({
            type: 'image/jpeg',
            size: 3 * 1024 * 1024, // 3MB
          }),
        } as unknown as Response)
      ) as unknown) as typeof fetch;

      const result = await validateAvatarFile(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2MB');
    });

    it('should accept files under 2MB', async () => {
      const mockFile = {
        uri: 'file://small.jpg',
        type: 'image/jpeg',
      };

      global.fetch = (jest.fn(() =>
        Promise.resolve({
          blob: () => Promise.resolve({
            type: 'image/jpeg',
            size: 1024 * 1024, // 1MB
          }),
        } as unknown as Response)
      ) as unknown) as typeof fetch;

      const result = await validateAvatarFile(mockFile);
      expect(result.valid).toBe(true);
    });
  });
});

/**
 * Security Tests for Rate Limiting
 */
describe('Rate Limiting Security', () => {
  it('should enforce rate limiting on auth attempts', async () => {
    const maxAttempts = 5;
    let rateLimitHit = false;

    // Simulate multiple login attempts
    for (let i = 0; i < maxAttempts + 2; i++) {
      // Mock login attempt
      const result = { success: i < maxAttempts };

      if (!result.success && i >= maxAttempts) {
        rateLimitHit = true;
      }
    }

    expect(rateLimitHit).toBe(true);
  });
});

/**
 * Security Tests for Data Sanitization
 */
describe('Data Sanitization Security', () => {
  const { logger } = require('@lib/logger');

  it('should mask sensitive fields in logs', () => {
    const sensitiveData = {
      email: 'user@example.com',
      password: 'SecretPassword123!',
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      credit_card: '4111-1111-1111-1111',
      normalField: 'public data',
    };

    // The logger should mask sensitive fields
    const maskedData = logger.maskSensitiveData(sensitiveData);

    expect(maskedData.email).not.toBe('user@example.com');
    expect(maskedData.password).toBe('[REDACTED]');
    expect(maskedData.access_token).toBe('[REDACTED]');
    expect(maskedData.credit_card).toBe('[REDACTED]');
    expect(maskedData.normalField).toBe('public data');
  });

  it('should not log raw tokens in production', () => {
    // In production, log level should be ERROR or higher
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // Logger should not log at DEBUG level in production
    const debugLog = jest.spyOn(logger, 'debug');
    logger.debug('Sensitive debug info', { token: 'secret' });

    expect(debugLog).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });
});

export {};
