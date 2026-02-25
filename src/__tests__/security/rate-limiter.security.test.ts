/**
 * Security Tests for Rate Limiter
 * Tests for fail-secure behavior and rate limit bypass prevention
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RateLimiter, rateLimiter, RATE_LIMITS } from '@lib/rateLimiter';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('RateLimiter Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('SEC-NEW-001: Fail-Secure Behavior', () => {
    it('should return false when AsyncStorage fails (fail-secure)', async () => {
      const testKey = 'login_test@example.com';
      const maxAttempts = 5;
      const windowMs = 15 * 60 * 1000;

      // Mock AsyncStorage to throw error
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage corrupted'));

      const result = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);

      // Fail-secure: Hata durumunda izin vermemeli
      expect(result).toBe(false);
    });

    it('should return false when JSON parse fails (fail-secure)', async () => {
      const testKey = 'login_test@example.com';
      const maxAttempts = 5;
      const windowMs = 15 * 60 * 1000;

      // Mock AsyncStorage to return invalid JSON
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json{');

      const result = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);

      // Fail-secure: JSON parse hatası durumunda izin vermemeli
      expect(result).toBe(false);
    });

    it('should return 0 remaining attempts when getRemainingAttempts fails', async () => {
      const testKey = 'login_test@example.com';
      const maxAttempts = 5;

      // Mock AsyncStorage to throw error
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const remaining = await rateLimiter.getRemainingAttempts(testKey, maxAttempts);

      // Fail-secure: Hata durumunda 0 kalan hak dön
      expect(remaining).toBe(0);
    });

    it('should return 0 wait time when getWaitTime fails (correct)', async () => {
      const testKey = 'login_test@example.com';
      const windowMs = 15 * 60 * 1000;

      // Mock AsyncStorage to throw error
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const waitTime = await rateLimiter.getWaitTime(testKey, windowMs);

      // Hata durumunda 0 bekleme süresi dön (doğru davranış)
      expect(waitTime).toBe(0);
    });

    it('should not allow brute force when rate limiter errors', async () => {
      const testKey = 'login_attacker@example.com';
      const maxAttempts = 5;
      const windowMs = 15 * 60 * 1000;

      // İlk deneme null döner (izin verilmeli)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const firstResult = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);
      expect(firstResult).toBe(true); // İlk deneme - izin ver

      // Sonraki deneme hata fırlatır (izin vermemeli)
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const secondResult = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);
      expect(secondResult).toBe(false); // Hata - fail-secure
    });
  });

  describe('SEC-NEW-004: clearAll() Rate Limit Bypass Prevention', () => {
    it('should only clear expired records, not active ones', async () => {
      const now = Date.now();
      const oldRecord = {
        count: 10,
        firstAttempt: now - 25 * 60 * 60 * 1000, // 25 saat önce
        lastAttempt: now - 25 * 60 * 60 * 1000,
      };
      const activeRecord = {
        count: 5,
        firstAttempt: now - 1000, // 1 saniye önce
        lastAttempt: now - 1000,
      };

      // Mock getAllKeys to return rate limit keys
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@cardvault_rate_login_old@example.com',
        '@cardvault_rate_login_active@example.com',
      ]);

      // Mock getItem to return records
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(oldRecord))
        .mockResolvedValueOnce(JSON.stringify(activeRecord));

      // Mock multiRemove
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await rateLimiter.clearAll();

      // Sadece eski kayıt silinmeli
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@cardvault_rate_login_old@example.com',
      ]);
    });

    it('should not clear records less than 24 hours old', async () => {
      const now = Date.now();
      const recentRecord = {
        count: 5,
        firstAttempt: now - 1000, // 1 saniye önce
        lastAttempt: now - 1000,
      };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@cardvault_rate_login_recent@example.com',
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(recentRecord));

      await rateLimiter.clearAll();

      // Hiçbir kayıt silinmemeli
      expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
    });

    it('should clear corrupted records', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@cardvault_rate_login_corrupted@example.com',
      ]);

      // Mock getItem to return invalid JSON
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json{');

      await rateLimiter.clearAll();

      // Bozuk kayıt silinmeli
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@cardvault_rate_login_corrupted@example.com',
      ]);
    });

    it('should prevent rate limit bypass via clearAll', async () => {
      const testKey = 'login_attacker@example.com';
      const maxAttempts = 5;
      const windowMs = 15 * 60 * 1000;
      const now = Date.now();

      // Rate limit reached
      const blockedRecord = {
        count: 5,
        firstAttempt: now - 1000, // 1 saniye önce - henüz bloklu
        lastAttempt: now - 1000,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(blockedRecord));

      // Kullanıcı bloklanmış olmalı
      const isBlocked = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);
      expect(isBlocked).toBe(false);

      // clearAll çağrıldığında aktif kaydı silmemeli
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([`@cardvault_rate_${testKey}`]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(blockedRecord));

      await rateLimiter.clearAll();

      // Aktif kayıt silinmemeli (24 saat dolmadı)
      expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();

      // Hala bloklu olmalı
      const stillBlocked = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);
      expect(stillBlocked).toBe(false);
    });
  });

  describe('Rate Limit Enforcement', () => {
    it('should enforce max attempts limit', async () => {
      const testKey = 'login_user@example.com';
      const maxAttempts = 5;
      const windowMs = 15 * 60 * 1000;
      const now = Date.now();

      // Mock rate limiter record
      const record = {
        count: 5,
        firstAttempt: now - 1000,
        lastAttempt: now - 1000,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(record));

      const result = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);

      // Limit aşıldı, false dönmeli
      expect(result).toBe(false);
    });

    it('should reset after window expires', async () => {
      const testKey = 'login_user@example.com';
      const maxAttempts = 5;
      const windowMs = 15 * 60 * 1000;
      const now = Date.now();

      // Zaman penceresi dışındaki eski kayıt
      const oldRecord = {
        count: 10,
        firstAttempt: now - windowMs - 1000, // Pencereden önce
        lastAttempt: now - windowMs - 1000,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldRecord));
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await rateLimiter.checkLimit(testKey, maxAttempts, windowMs);

      // Eski kayıt silinmeli ve izin verilmeli
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should correctly calculate remaining attempts', async () => {
      const testKey = 'login_user@example.com';
      const maxAttempts = 5;
      const now = Date.now();

      // 2 deneme yapılmış
      const record = {
        count: 2,
        firstAttempt: now - 1000,
        lastAttempt: now - 1000,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(record));

      const remaining = await rateLimiter.getRemainingAttempts(testKey, maxAttempts);

      expect(remaining).toBe(3); // 5 - 2 = 3
    });
  });

  describe('Rate Limit Presets', () => {
    it('should have correct LOGIN preset', () => {
      expect(RATE_LIMITS.LOGIN.maxAttempts).toBe(5);
      expect(RATE_LIMITS.LOGIN.windowMs).toBe(15 * 60 * 1000); // 15 dakika
    });

    it('should have correct PASSWORD_RESET preset', () => {
      expect(RATE_LIMITS.PASSWORD_RESET.maxAttempts).toBe(3);
      expect(RATE_LIMITS.PASSWORD_RESET.windowMs).toBe(60 * 60 * 1000); // 1 saat
    });

    it('should have correct REGISTER preset', () => {
      expect(RATE_LIMITS.REGISTER.maxAttempts).toBe(5);
      expect(RATE_LIMITS.REGISTER.windowMs).toBe(60 * 60 * 1000); // 1 saat
    });

    it('should have correct API_CALL preset', () => {
      expect(RATE_LIMITS.API_CALL.maxAttempts).toBe(100);
      expect(RATE_LIMITS.API_CALL.windowMs).toBe(60 * 1000); // 1 dakika
    });
  });
});
