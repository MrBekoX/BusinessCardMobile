/**
 * Rate Limiter
 * Brute force koruması için rate limiting
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';

const logger = new Logger('RateLimiter');

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

const RATE_LIMIT_PREFIX = '@cardvault_rate_';

export class RateLimiter {
  /**
   * Rate limit kontrolü yap
   * @param key - Benzersiz anahtar (örneğin: `login_${email}`)
   * @param maxAttempts - Maksimum deneme sayısı
   * @param windowMs - Zaman penceresi (milisaniye)
   * @returns true: izin verildi, false: limit aşıldı
   */
  async checkLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
    try {
      const record = await this.getRecord(key);

      if (!record) {
        return true; // İlk deneme
      }

      const now = Date.now();
      const windowStart = now - windowMs;

      // Zaman penceresi dışındaysa sıfırla
      if (record.firstAttempt < windowStart) {
        await this.removeRecord(key);
        return true;
      }

      // Limit kontrolü
      if (record.count >= maxAttempts) {
        const remainingTime = Math.ceil((record.firstAttempt + windowMs - now) / 1000);
        logger.warn(`Rate limit exceeded for ${key}. Retry after ${remainingTime}s`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Rate limit check failed', error);
      return true; // Hata durumunda izin ver
    }
  }

  /**
   * Deneme kaydet
   */
  async recordAttempt(key: string): Promise<void> {
    try {
      const record = await this.getRecord(key);
      const now = Date.now();

      const newRecord: AttemptRecord = {
        count: (record?.count || 0) + 1,
        firstAttempt: record?.firstAttempt || now,
        lastAttempt: now,
      };

      await AsyncStorage.setItem(
        `${RATE_LIMIT_PREFIX}${key}`,
        JSON.stringify(newRecord)
      );

      logger.debug(`Attempt recorded for ${key}: ${newRecord.count}`);
    } catch (error) {
      logger.error('Failed to record attempt', error);
    }
  }

  /**
   * Başarılı işlemden sonra kayıtları sıfırla
   */
  async resetAttempts(key: string): Promise<void> {
    try {
      await this.removeRecord(key);
      logger.debug(`Attempts reset for ${key}`);
    } catch (error) {
      logger.error('Failed to reset attempts', error);
    }
  }

  /**
   * Kalan deneme sayısını al
   */
  async getRemainingAttempts(key: string, maxAttempts: number): Promise<number> {
    try {
      const record = await this.getRecord(key);
      if (!record) return maxAttempts;
      return Math.max(0, maxAttempts - record.count);
    } catch (error) {
      logger.error('Failed to get remaining attempts', error);
      return maxAttempts;
    }
  }

  /**
   * Bekleme süresini al (saniye)
   */
  async getWaitTime(key: string, windowMs: number): Promise<number> {
    try {
      const record = await this.getRecord(key);
      if (!record) return 0;

      const now = Date.now();
      const windowEnd = record.firstAttempt + windowMs;

      if (windowEnd > now) {
        return Math.ceil((windowEnd - now) / 1000);
      }

      return 0;
    } catch (error) {
      logger.error('Failed to get wait time', error);
      return 0;
    }
  }

  /**
   * Tüm rate limit kayıtlarını temizle
   */
  async clearAll(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const rateLimitKeys = allKeys.filter(k => k.startsWith(RATE_LIMIT_PREFIX));
      await AsyncStorage.multiRemove(rateLimitKeys);
      logger.info('All rate limit records cleared');
    } catch (error) {
      logger.error('Failed to clear rate limit records', error);
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async getRecord(key: string): Promise<AttemptRecord | null> {
    try {
      const data = await AsyncStorage.getItem(`${RATE_LIMIT_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async removeRecord(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${RATE_LIMIT_PREFIX}${key}`);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit presets
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  REGISTER: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  API_CALL: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 per minute
} as const;

export default RateLimiter;
