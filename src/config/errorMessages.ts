/**
 * Standartlaştırılmış Türkçe hata mesajları.
 */

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  // Genel Hatalar
  UNEXPECTED_ERROR: 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.',
  NETWORK_REQUEST_FAILED: 'İnternet bağlantınızı kontrol edin.',
  OFFLINE_MODE: 'Çevrimdışı modasınız. İnternet bağlantısı gerekiyor.',
  TIMEOUT_ERROR: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  OPERATION_TIMEOUT: 'İşlem zaman aşımına uğradı.',
  TOO_MANY_REQUESTS: 'Çok fazla istek. Lütfen bekleyin.',
  VALIDATION_ERROR: 'Geçersiz veri.',

  // Auth Hataları
  INVALID_CREDENTIALS: 'Geçersiz e-posta veya şifre.',
  EMAIL_ALREADY_IN_USE: 'Bu e-posta adresi zaten kullanılıyor.',
  WEAK_PASSWORD: 'Şifre çok zayıf. Daha güçlü bir şifre seçin.',
  USER_NOT_FOUND: 'Kullanıcı bulunamadı.',
  SESSION_EXPIRED: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
  INVALID_EMAIL_FORMAT: 'Geçersiz e-posta formatı.',
  INVALID_PHONE_FORMAT: 'Geçersiz telefon numarası formatı.',

  // Kartvizit Hataları
  CARD_CREATION_FAILED: 'Kartvizit oluşturulamadı.',
  CARD_UPDATE_FAILED: 'Kartvizit güncellenemedi.',
  CARD_DELETE_FAILED: 'Kartvizit silinemedi.',
  CARD_NOT_FOUND: 'Kartvizit bulunamadı.',
  IMAGE_UPLOAD_FAILED: 'Resim yüklenirken bir hata oluştu.',
  INVALID_CARD_DATA: 'Kartvizit bilgileri geçersiz.',
  CARD_LIMIT_EXCEEDED: 'Maksimum kartvizit limitine ulaştınız.',

  // QR Kod Hataları
  QR_GENERATION_FAILED: 'QR kod oluşturulamadı.',
  QR_SCAN_FAILED: 'QR kod okunamadı.',
  INVALID_QR_DATA: 'Geçersiz QR kod verisi.',

  // İzin Hataları
  CAMERA_PERMISSION_DENIED: 'Kamera izni reddedildi. Lütfen ayarlardan izin verin.',
  GALLERY_PERMISSION_DENIED: 'Galeri izni reddedildi. Lütfen ayarlardan izin verin.',
  NOTIFICATION_PERMISSION_DENIED: 'Bildirim izni reddedildi.',
  LOCATION_PERMISSION_DENIED: 'Konum izni reddedildi.',

  // Paylaşım Hataları
  SHARE_FAILED: 'Paylaşım başarısız oldu.',
  VCARD_GENERATION_FAILED: 'vCard dosyası oluşturulamadı.',
  SOCIAL_SHARE_FAILED: 'Sosyal medya paylaşımı başarısız oldu.',

  // Koleksiyon Hataları
  COLLECTION_CREATION_FAILED: 'Koleksiyon oluşturulamadı.',
  COLLECTION_DELETE_FAILED: 'Koleksiyon silinemedi.',
  COLLECTION_NOT_FOUND: 'Koleksiyon bulunamadı.',
  COLLECTION_LIMIT_EXCEEDED: 'Maksimum koleksiyon limitine ulaştınız.',

  // Veritabanı Hataları
  DATABASE_CONNECTION_FAILED: 'Veritabanı bağlantısı başarısız oldu.',
  DATABASE_QUERY_FAILED: 'Veritabanı sorgusu başarısız oldu.',
  DATA_SYNC_FAILED: 'Veri senkronizasyonu başarısız oldu.',

  // Dosya İşlemleri
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük.',
  FILE_FORMAT_NOT_SUPPORTED: 'Dosya formatı desteklenmiyor.',
  FILE_UPLOAD_FAILED: 'Dosya yüklenirken bir hata oluştu.',
  FILE_DOWNLOAD_FAILED: 'Dosya indirilirken bir hata oluştu.',

  // Cache ve Offline
  CACHE_WRITE_FAILED: 'Cache yazma işlemi başarısız oldu.',
  CACHE_READ_FAILED: 'Cache okuma işlemi başarısız oldu.',
  CACHE_CLEAR_FAILED: 'Cache temizleme işlemi başarısız oldu.',
  OFFLINE_SYNC_FAILED: 'Offline senkronizasyon başarısız oldu.',

  // Validasyon Hataları
  INVALID_INPUT_FORMAT: 'Geçersiz giriş formatı.',
  REQUIRED_FIELD_MISSING: 'Zorunlu alan eksik.',
  FIELD_TOO_LONG: 'Alan çok uzun.',
  FIELD_TOO_SHORT: 'Alan çok kısa.',
  INVALID_URL_FORMAT: 'Geçersiz URL formatı.',
  INVALID_DATE_FORMAT: 'Geçersiz tarih formatı.',
  INVALID_NUMBER_FORMAT: 'Geçersiz sayı formatı.',

  // Güvenlik Hataları
  SECURITY_VIOLATION: 'Güvenlik ihlali tespit edildi.',
  UNAUTHORIZED_ACCESS: 'Yetkisiz erişim denemesi.',
  TOKEN_EXPIRED: 'Erişim anahtarı süresi doldu.',
  INVALID_TOKEN: 'Geçersiz erişim anahtarı.',
  RATE_LIMIT_EXCEEDED: 'İstek limiti aşıldı. Lütfen daha sonra tekrar deneyin.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  // Auth Başarıları
  LOGIN_SUCCESS: 'Giriş başarılı.',
  REGISTER_SUCCESS: 'Kayıt başarılı.',
  LOGOUT_SUCCESS: 'Çıkış başarılı.',
  PASSWORD_RESET_SUCCESS: 'Şifre sıfırlama e-postası gönderildi.',
  EMAIL_VERIFICATION_SENT: 'E-posta doğrulama bağlantısı gönderildi.',

  // Kartvizit Başarıları
  CARD_CREATED: 'Kartvizit başarıyla oluşturuldu.',
  CARD_UPDATED: 'Kartvizit başarıyla güncellendi.',
  CARD_DELETED: 'Kartvizit başarıyla silindi.',
  CARD_SHARED: 'Kartvizit başarıyla paylaşıldı.',
  CARD_IMPORTED: 'Kartvizit başarıyla içe aktarıldı.',
  CARD_EXPORTED: 'Kartvizit başarıyla dışa aktarıldı.',

  // Koleksiyon Başarıları
  COLLECTION_CREATED: 'Koleksiyon başarıyla oluşturuldu.',
  COLLECTION_UPDATED: 'Koleksiyon başarıyla güncellendi.',
  COLLECTION_DELETED: 'Koleksiyon başarıyla silindi.',
  COLLECTION_SHARED: 'Koleksiyon başarıyla paylaşıldı.',

  // Profil Başarıları
  PROFILE_UPDATED: 'Profil bilgileri güncellendi.',
  PROFILE_PICTURE_UPDATED: 'Profil resmi güncellendi.',
  PASSWORD_CHANGED: 'Şifre başarıyla değiştirildi.',
  ACCOUNT_DELETED: 'Hesap başarıyla silindi.',

  // Veri İşlemleri
  DATA_SYNCED: 'Veri başarıyla senkronize edildi.',
  CACHE_CLEARED: 'Cache başarıyla temizlendi.',
  BACKUP_CREATED: 'Yedekleme başarıyla oluşturuldu.',
  RESTORE_COMPLETED: 'Geri yükleme işlemi tamamlandı.',

  // Bildirimler
  NOTIFICATION_SENT: 'Bildirim başarıyla gönderildi.',
  NOTIFICATION_ENABLED: 'Bildirimler etkinleştirildi.',
  NOTIFICATION_DISABLED: 'Bildirimler devre dışı bırakıldı.',

  // İzinler
  PERMISSION_GRANTED: 'İzin verildi.',
  PERMISSION_REVOKED: 'İzin geri alındı.',

  // Dosya İşlemleri
  FILE_UPLOADED: 'Dosya başarıyla yüklendi.',
  FILE_DOWNLOADED: 'Dosya başarıyla indirildi.',
  FILE_DELETED: 'Dosya başarıyla silindi.',

  // Genel
  SETTINGS_SAVED: 'Ayarlar kaydedildi.',
  PREFERENCES_UPDATED: 'Tercihler güncellendi.',
  FEEDBACK_SUBMITTED: 'Geri bildirim gönderildi.',
  RATING_SUBMITTED: 'Değerlendirme gönderildi.',
} as const;

export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;

// ==================== INFO MESSAGES ====================

export const INFO_MESSAGES = {
  OFFLINE_MODE_ACTIVE: 'Çevrimdışı mod aktif. Bazı özellikler kullanılamayabilir.',
  SYNC_IN_PROGRESS: 'Senkronizasyon devam ediyor...',
  CHECKING_UPDATES: 'Güncellemeler kontrol ediliyor...',
  LOADING_DATA: 'Veri yükleniyor...',
  PROCESSING_REQUEST: 'İşlem gerçekleştiriliyor...',
  VALIDATING_INPUT: 'Giriş doğrulanıyor...',
  PREPARING_SHARE: 'Paylaşım hazırlanıyor...',
  GENERATING_QR: 'QR kod oluşturuluyor...',
  SCANNING_QR: 'QR kod taranıyor...',
  CONNECTING_SERVER: 'Sunucuya bağlanılıyor...',
  FETCHING_DATA: 'Veri alınıyor...',
  SAVING_CHANGES: 'Değişiklikler kaydediliyor...',
  UPLOADING_IMAGE: 'Resim yükleniyor...',
  COMPRESSING_IMAGE: 'Resim sıkıştırılıyor...',
  PREPARING_DOWNLOAD: 'İndirme hazırlanıyor...',
  BACKGROUND_SYNC: 'Arka planda senkronizasyon yapılıyor.',
  MAINTENANCE_MODE: 'Bakım modu aktif. Bazı özellikler geçici olarak kullanılamayabilir.',
} as const;

export type InfoMessageKey = keyof typeof INFO_MESSAGES;

// ==================== HELPER FUNCTIONS ====================

/**
 * Hata mesajını kullanıcı dostu formata dönüştür
 */
export const getErrorMessage = (
  errorCode: ErrorMessageKey | string,
  customMessage: string | null = null
): string => {
  if (customMessage) {
    return customMessage;
  }
  
  return (ERROR_MESSAGES as Record<string, string>)[errorCode] || ERROR_MESSAGES.UNEXPECTED_ERROR;
};

/**
 * Başarı mesajını al
 */
export const getSuccessMessage = (
  successCode: SuccessMessageKey | string,
  customMessage: string | null = null
): string => {
  if (customMessage) {
    return customMessage;
  }
  
  return (SUCCESS_MESSAGES as Record<string, string>)[successCode] || SUCCESS_MESSAGES.CARD_CREATED;
};
