/**
 * Merkezi yapılandırma yönetimi.
 * Tüm ortam değişkenleri ve sabit ayarlar buradan okunur.
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const Settings = {
  // Supabase Yapılandırması
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  },

  // Uygulama Ayarları
  app: {
    defaultLanguage: 'tr',
    theme: 'light', // 'light' | 'dark' | 'system'
    version: '1.0.0',
  },

  // Medya Ayarları
  media: {
    imageQuality: 0.8, // Resim sıkıştırma kalitesi (0-1)
    maxImageSize: 1024, // Maksimum resim boyutu (genişlik/yükseklik)
    allowedImageFormats: ['jpg', 'jpeg', 'png'],
  },

  // QR Kod Ayarları
  qr: {
    size: 200, // QR kod boyutu (px)
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    errorCorrectionLevel: 'M', // L, M, Q, H
  },

  // Validasyon
  validation: {
    passwordMinLength: 8,
    phoneFormat: 'TR', // Türkiye formatı
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
  console.warn('Supabase URL ve Anon Key .env dosyasında tanımlanmalıdır.');
}

export default Settings;