/**
 * Merkezi yapılandırma yönetimi.
 * Tüm ortam değişkenleri ve sabit ayarlar buradan okunur.
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { Logger } from '@lib/logger';

const logger = new Logger('Settings');

// ==================== TYPE DEFINITIONS ====================

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface AppConfig {
  defaultLanguage: string;
  theme: 'light' | 'dark' | 'system';
  version: string;
}

interface MediaConfig {
  imageQuality: number;
  maxImageSize: number;
  allowedImageFormats: string[];
}

interface QRConfig {
  size: number;
  backgroundColor: string;
  foregroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

interface ValidationConfig {
  passwordMinLength: number;
  phoneFormat: string;
}

interface CacheConfig {
  maxAge: number;
  enableOfflineMode: boolean;
}

interface NotificationsConfig {
  enabled: boolean;
  soundEnabled: boolean;
}

interface DeepLinkingConfig {
  scheme: string;
  prefixes: string[];
}

interface NetworkConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface AnalyticsConfig {
  enabled: boolean;
  trackUserInteractions: boolean;
  trackPerformance: boolean;
}

interface SettingsConfig {
  supabase: SupabaseConfig;
  app: AppConfig;
  media: MediaConfig;
  qr: QRConfig;
  validation: ValidationConfig;
  cache: CacheConfig;
  notifications: NotificationsConfig;
  deepLinking: DeepLinkingConfig;
  network: NetworkConfig;
  analytics: AnalyticsConfig;
}

// ==================== SETTINGS ====================

const Settings: SettingsConfig = {
  // Supabase Yapılandırması
  supabase: {
    url: SUPABASE_URL || '',
    anonKey: SUPABASE_ANON_KEY || '',
  },

  // Uygulama Ayarları
  app: {
    defaultLanguage: 'tr',
    theme: 'light',
    version: '1.0.0',
  },

  // Medya Ayarları
  media: {
    imageQuality: 0.8,
    maxImageSize: 1024,
    allowedImageFormats: ['jpg', 'jpeg', 'png'],
  },

  // QR Kod Ayarları
  qr: {
    size: 200,
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    errorCorrectionLevel: 'M',
  },

  // Validasyon
  validation: {
    passwordMinLength: 8,
    phoneFormat: 'TR',
  },

  // Offline & Cache
  cache: {
    maxAge: 86400000, // 24 saat (ms)
    enableOfflineMode: true,
  },

  // Bildirimler
  notifications: {
    enabled: true,
    soundEnabled: true,
  },

  // Deep Linking
  deepLinking: {
    scheme: 'cardvault',
    prefixes: ['cardvault://', 'https://cardvault.app'],
  },

  // Network
  network: {
    timeout: 30000, // 30 saniye
    retryAttempts: 3,
    retryDelay: 1000, // 1 saniye
  },

  // Analytics
  analytics: {
    enabled: true,
    trackUserInteractions: true,
    trackPerformance: true,
  },
};

// Ayarların geçerliliğini kontrol et
if (!Settings.supabase.url || !Settings.supabase.anonKey) {
  logger.warn('Supabase URL and Anon Key must be defined in .env file');
}

export default Settings;
