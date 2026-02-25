/**
 * Security Tests for Secure Storage
 * Tests for chunk metadata security and storage patterns
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorageService, secureStorage, SECURE_KEYS } from '@lib/secureStorage';

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

describe('SecureStorage Security', () => {
  let storageService: SecureStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    storageService = new SecureStorageService();
  });

  describe('SEC-NEW-002: Chunk Metadata Security', () => {
    it('should store chunk metadata in SecureStore, not AsyncStorage', async () => {
      // 2048 byte'dan büyük veri (chunk gerektirir)
      const largeValue = 'x'.repeat(3000);
      const testKey = 'test_large_data';

      await storageService.setSecureItem(testKey, largeValue);

      // SecureStore'da meta key oluşturulmalı
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'secure_test_large_data_meta',
        expect.any(String)
      );
    });

    it('should encode chunk count as base64 in SecureStore', async () => {
      const largeValue = 'x'.repeat(3000);
      const testKey = 'test_large_data';

      await storageService.setSecureItem(testKey, largeValue);

      // SecureStore.setItemAsync çağrıldı ve _meta içeren bir çağrı var
      expect(SecureStore.setItemAsync).toHaveBeenCalled();

      // _meta içeren bir çağrı yapıldı
      const hasMetaCall = (SecureStore.setItemAsync as jest.Mock).mock.calls.some(
        call => call[0]?.includes('_meta')
      );

      expect(hasMetaCall).toBe(true);

      // Meta çağrısını bul
      const metaCall = (SecureStore.setItemAsync as jest.Mock).mock.calls.find(
        call => call[0]?.includes('_meta')
      );

      expect(metaCall).toBeDefined();
      const metaValue = metaCall![1];
      // Base64 decode edildiğinde sayı olmalı
      const decoded = Buffer.from(metaValue, 'base64').toString();
      expect(parseInt(decoded, 10)).toBeGreaterThan(0);
    });

    it('should NOT store chunk count in AsyncStorage', async () => {
      const largeValue = 'x'.repeat(3000);
      const testKey = 'test_large_data';

      await storageService.setSecureItem(testKey, largeValue);

      // AsyncStorage'a _chunks key'i ile yazma yapılmamalı
      const chunkCalls = (AsyncStorage.setItem as jest.Mock).mock.calls.filter(
        call => call[0]?.includes('_chunks')
      );

      expect(chunkCalls.length).toBe(0);
    });

    it('should read chunk count from SecureStore meta', async () => {
      const testKey = 'test_large_data';
      const chunkCount = 3;

      // Mock SecureStore meta
      const metaValue = Buffer.from(chunkCount.toString()).toString('base64');
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(metaValue) // meta
        .mockResolvedValueOnce('chunk1') // chunk_0
        .mockResolvedValueOnce('chunk2') // chunk_1
        .mockResolvedValueOnce('chunk3'); // chunk_2

      const result = await storageService.getSecureItem(testKey);

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        'secure_test_large_data_meta'
      );
      expect(result).toBe('chunk1chunk2chunk3');
    });

    it('should migrate old AsyncStorage metadata to SecureStore', async () => {
      const testKey = 'test_migration';
      const oldChunkCount = 2;

      // Eski format: AsyncStorage'da _chunks
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(oldChunkCount.toString()); // _chunks

      // Yeni format: SecureStore'da _meta yok
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null) // meta yok
        .mockResolvedValueOnce('chunk1')
        .mockResolvedValueOnce('chunk2');

      await storageService.getSecureItem(testKey);

      // Migration yapılmalı
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'secure_test_migration_meta',
        expect.any(String)
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        'secure_test_migration_chunks'
      );
    });

    it('should remove SecureStore metadata when deleting large items', async () => {
      const testKey = 'test_large_data';

      // Mock chunk count
      const metaValue = Buffer.from('3').toString('base64');
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(metaValue);

      await storageService.removeSecureItem(testKey);

      // Meta da silinmeli
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'secure_test_large_data_meta'
      );
    });
  });

  describe('Token Storage Security', () => {
    it('should use secure prefix for all keys', async () => {
      const testValue = 'sensitive_data';

      await storageService.setSecureItem('test_key', testValue);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        expect.stringMatching(/^secure_/),
        testValue
      );
    });

    it('should store auth tokens in SecureStore', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      await storageService.setSecureItem(SECURE_KEYS.AUTH_TOKEN, token);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        `secure_${SECURE_KEYS.AUTH_TOKEN}`,
        token
      );
    });

    it('should store refresh tokens in SecureStore', async () => {
      const refreshToken = 'refresh_token_value';

      await storageService.setSecureItem(SECURE_KEYS.REFRESH_TOKEN, refreshToken);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        `secure_${SECURE_KEYS.REFRESH_TOKEN}`,
        refreshToken
      );
    });

    it('should have defined secure storage keys', () => {
      expect(SECURE_KEYS.AUTH_SESSION).toBe('auth_session');
      expect(SECURE_KEYS.AUTH_TOKEN).toBe('auth_token');
      expect(SECURE_KEYS.REFRESH_TOKEN).toBe('refresh_token');
      expect(SECURE_KEYS.USER_DATA).toBe('user_data');
      expect(SECURE_KEYS.SYNC_QUEUE).toBe('sync_queue');
    });
  });

  describe('Large File Chunking', () => {
    it('should chunk data larger than MAX_SECURE_VALUE_SIZE', async () => {
      // 2048 byte'dan büyük veri
      const largeValue = 'x'.repeat(5000);
      const testKey = 'test_large';

      await storageService.setSecureItem(testKey, largeValue);

      // 5000 / 2048 = 3 chunk olmalı
      const chunkCalls = (SecureStore.setItemAsync as jest.Mock).mock.calls.filter(
        call => call[0]?.includes('_chunk_')
      );

      expect(chunkCalls.length).toBe(3);
    });

    it('should correctly reassemble chunks when reading', async () => {
      const testKey = 'test_large';
      const metaValue = Buffer.from('2').toString('base64');

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(metaValue) // meta
        .mockResolvedValueOnce('first_chunk_data')
        .mockResolvedValueOnce('second_chunk_data');

      const result = await storageService.getSecureItem(testKey);

      expect(result).toBe('first_chunk_datasecond_chunk_data');
    });

    it('should handle missing chunks gracefully', async () => {
      const testKey = 'test_corrupted';
      const metaValue = Buffer.from('3').toString('base64');

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(metaValue) // meta
        .mockResolvedValueOnce('chunk1')
        .mockResolvedValueOnce(null) // chunk2 eksik
        .mockResolvedValueOnce('chunk3');

      const result = await storageService.getSecureItem(testKey);

      // Eksik chunk varsa sadece mevcutları birleştir
      expect(result).toBe('chunk1chunk3');
    });

    it('should return null for completely missing data', async () => {
      const testKey = 'test_missing';

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await storageService.getSecureItem(testKey);

      expect(result).toBeNull();
    });
  });

  describe('clearAll Security', () => {
    it('should clear all secure items', async () => {
      // Mock old-style metadata
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'secure_old_data_chunks',
      ]);

      await storageService.clearAll();

      // Eski metadayı bulup temizlemeli
      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
    });

    it('should handle empty storage gracefully', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

      const result = await storageService.clearAll();

      expect(result).toBe(true);
    });

    it('should handle errors during clearAll', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await storageService.clearAll();

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should return false when SecureStore fails on set', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('SecureStore error'));

      const result = await storageService.setSecureItem('test_key', 'test_value');

      expect(result).toBe(false);
    });

    it('should return null when SecureStore fails on get', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('SecureStore error'));

      const result = await storageService.getSecureItem('test_key');

      expect(result).toBeNull();
    });

    it('should return false when SecureStore fails on remove', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('SecureStore error'));

      const result = await storageService.removeSecureItem('test_key');

      expect(result).toBe(false);
    });
  });
});
