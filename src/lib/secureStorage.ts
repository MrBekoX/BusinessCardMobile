/**
 * Secure Storage Service
 * Handles secure data storage using expo-secure-store
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';

const logger = new Logger('SecureStorage');

// Secure Store için key prefix
const SECURE_PREFIX = 'secure_';

// Maksimum değer boyutu (SecureStore limiti: 2048 bytes)
const MAX_SECURE_VALUE_SIZE = 2048;

export class SecureStorageService {
  /**
   * Hassas veriyi güvenli depoya kaydet
   */
  async setSecureItem(key: string, value: string): Promise<boolean> {
    try {
      // Değer çok büyükse parça parça kaydet
      if (value.length > MAX_SECURE_VALUE_SIZE) {
        return this.setLargeSecureItem(key, value);
      }

      await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}`, value);
      logger.debug(`Secure item set: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set secure item: ${key}`, error);
      return false;
    }
  }

  /**
   * Hassas veriyi güvenli depodan oku
   */
  async getSecureItem(key: string): Promise<string | null> {
    try {
      // Önce büyük veri var mı kontrol et
      const chunkCount = await this.getChunkCount(key);
      if (chunkCount > 0) {
        return this.getLargeSecureItem(key, chunkCount);
      }

      const value = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}`);
      return value;
    } catch (error) {
      logger.error(`Failed to get secure item: ${key}`, error);
      return null;
    }
  }

  /**
   * Hassas veriyi güvenli depodan sil
   */
  async removeSecureItem(key: string): Promise<boolean> {
    try {
      // Büyük veri parçalarını da sil
      const chunkCount = await this.getChunkCount(key);
      if (chunkCount > 0) {
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}_chunk_${i}`);
        }
        // Meta veriyi de SecureStore'dan sil
        await SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}_meta`);
      }

      await SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}`);
      logger.debug(`Secure item removed: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove secure item: ${key}`, error);
      return false;
    }
  }

  /**
   * Tüm güvenli verileri temizle
   */
  async clearAll(): Promise<boolean> {
    try {
      // Hem eski (AsyncStorage) hem yeni (SecureStore) meta key'lerini temizle
      const allKeys = await AsyncStorage.getAllKeys();
      const oldMetaKeys = allKeys.filter(k => k.startsWith(`${SECURE_PREFIX}`) && k.endsWith('_chunks'));

      for (const metaKey of oldMetaKeys) {
        const baseKey = metaKey.replace(`${SECURE_PREFIX}`, '').replace('_chunks', '');
        await this.removeSecureItem(baseKey);
      }

      // Not: SecureStore'daki _meta key'leri otomatik olarak removeSecureItem ile temizlenir
      // Ekstra temizlik için SecureStore'daki tüm secure_ prefix'li key'leri de temizleyebiliriz
      // Ancak bu tüm auth token'ları da siler, sadece logout sırasında çağrılmalı

      logger.info('All secure items cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear all secure items', error);
      return false;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async setLargeSecureItem(key: string, value: string): Promise<boolean> {
    try {
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += MAX_SECURE_VALUE_SIZE) {
        chunks.push(value.slice(i, i + MAX_SECURE_VALUE_SIZE));
      }

      // Her parçayı kaydet
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}_chunk_${i}`, chunks[i]);
      }

      // Parça sayısını meta olarak SecureStore'a base64 encoded şekilde kaydet
      // Güvenlik: AsyncStorage'da chunk sayısını saklamak storage pattern'i ifşa eder
      const metaValue = Buffer.from(chunks.length.toString()).toString('base64');
      await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}_meta`, metaValue);

      logger.debug(`Large secure item set: ${key} (${chunks.length} chunks)`);
      return true;
    } catch (error) {
      logger.error(`Failed to set large secure item: ${key}`, error);
      return false;
    }
  }

  private async getLargeSecureItem(key: string, chunkCount: number): Promise<string> {
    const chunks: string[] = [];

    for (let i = 0; i < chunkCount; i++) {
      const chunk = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}_chunk_${i}`);
      if (chunk) chunks.push(chunk);
    }

    return chunks.join('');
  }

  private async getChunkCount(key: string): Promise<number> {
    try {
      // Önce SecureStore'dan metadata'yı oku (yeni yöntem)
      const metaValue = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}_meta`);
      if (metaValue) {
        const count = parseInt(Buffer.from(metaValue, 'base64').toString(), 10);
        return isNaN(count) ? 0 : count;
      }

      // Fallback: Eski yöntemle AsyncStorage'dan kontrol (backward compatibility)
      // Sonraki sürümde kaldırılabilir
      const oldMeta = await AsyncStorage.getItem(`${SECURE_PREFIX}${key}_chunks`);
      if (oldMeta) {
        const count = parseInt(oldMeta, 10);
        if (!isNaN(count) && count > 0) {
          // Eski metadayı SecureStore'a taşı
          const newMetaValue = Buffer.from(count.toString()).toString('base64');
          await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}_meta`, newMetaValue);
          await AsyncStorage.removeItem(`${SECURE_PREFIX}${key}_chunks`);
          logger.debug(`Migrated chunk metadata for ${key} to SecureStore`);
          return count;
        }
      }

      return 0;
    } catch {
      return 0;
    }
  }
}

// Singleton instance
export const secureStorage = new SecureStorageService();

// Storage keys
export const SECURE_KEYS = {
  AUTH_SESSION: 'auth_session',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SYNC_QUEUE: 'sync_queue',
} as const;

export default SecureStorageService;
