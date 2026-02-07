/**
 * Girdi doğrulama fonksiyonları.
 * Supabase'e veri göndermeden önce mutlaka kullanılmalıdır.
 */

import { ValidationResult, ValidatorOptions } from '@/types';

// ==================== BASIC VALIDATORS ====================

/**
 * E-posta formatını doğrular.
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Şifrenin minimum gereksinimleri karşılayıp karşılamadığını kontrol eder.
 */
export const isValidPassword = (password: string | null | undefined): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  // Minimum 8 karakter
  if (password.length < 8) return false;
  
  // En az bir büyük harf
  if (!/[A-Z]/.test(password)) return false;
  
  // En az bir küçük harf
  if (!/[a-z]/.test(password)) return false;
  
  // En az bir rakam
  if (!/\d/.test(password)) return false;
  
  // En az bir özel karakter
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
};

/**
 * Boş veya sadece boşluk içeren metinleri reddeder.
 */
export const isNotEmpty = (text: string | null | undefined): boolean => {
  return text !== null && text !== undefined && typeof text === 'string' && text.trim().length > 0;
};

/**
 * Telefon numarası formatını doğrular (Türkiye standartı).
 */
export const isValidPhone = (phone: string | null | undefined): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  // Türk telefon formatı: +90 5XX XXX XX XX veya 05XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * URL formatını doğrular.
 */
export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Boş URL'leri kabul et
  if (url.trim() === '') return true;
  
  try {
    new URL(url);
    return true;
  } catch {
    // URL başına http:// ekle ve tekrar dene
    try {
      new URL(`http://${url}`);
      return true;
    } catch {
      return false;
    }
  }
};

// ==================== SOCIAL MEDIA VALIDATORS ====================

type SocialPlatform = 'instagram' | 'linkedin' | 'x' | 'youtube' | 'facebook' | 'whatsapp';

/**
 * Sosyal medya URL'sinin platforma uygun olup olmadığını kontrol eder.
 */
export const isValidSocialUrl = (url: string | null | undefined, platform: SocialPlatform): boolean => {
  if (!isValidUrl(url)) return false;
  if (!url) return false;
  
  const patterns: Record<SocialPlatform, RegExp> = {
    instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/,
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+/,
    x: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/,
    youtube: /^https?:\/\/(www\.)?youtube\.com\/(channel|c|user)\/.+/,
    facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/,
    whatsapp: /^https?:\/\/(www\.)?wa\.me\/.+/,
  };
  
  return patterns[platform]?.test(url) || false;
};

// ==================== CARD DATA TYPES ====================

interface CardData {
  company_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  instagram_url?: string;
  linkedin_url?: string;
  x_url?: string;
  youtube_url?: string;
  facebook_url?: string;
  position?: string;
  address?: string;
  [key: string]: unknown;
}

interface UserData {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface CollectionData {
  name?: string;
  description?: string;
}

interface FileData {
  size: number;
  type: string;
}

// ==================== DATA VALIDATORS ====================

/**
 * Kartvizit nesnesinin gerekli alanları içerip içermediğini doğrular.
 */
export const validateCardData = (cardData: CardData): ValidationResult => {
  // Firma adı kontrolü
  if (!isNotEmpty(cardData.company_name)) {
    return { isValid: false, message: 'Firma adı boş olamaz.' };
  }
  
  // E-posta kontrolü
  if (cardData.email && !isValidEmail(cardData.email)) {
    return { isValid: false, message: 'Geçersiz e-posta formatı.' };
  }
  
  // Telefon kontrolü
  if (cardData.phone && !isValidPhone(cardData.phone)) {
    return { isValid: false, message: 'Geçersiz telefon numarası formatı.' };
  }
  
  // Web sitesi kontrolü
  if (cardData.website && !isValidUrl(cardData.website)) {
    return { isValid: false, message: 'Geçersiz web sitesi adresi.' };
  }
  
  // Sosyal medya URL'lerini kontrol et
  const socialPlatforms: Array<{ key: keyof CardData; platform: SocialPlatform }> = [
    { key: 'instagram_url', platform: 'instagram' },
    { key: 'linkedin_url', platform: 'linkedin' },
    { key: 'x_url', platform: 'x' },
    { key: 'youtube_url', platform: 'youtube' },
    { key: 'facebook_url', platform: 'facebook' },
  ];
  
  for (const { key, platform } of socialPlatforms) {
    const value = cardData[key];
    if (value && typeof value === 'string' && !isValidSocialUrl(value, platform)) {
      return { isValid: false, message: `Geçersiz ${platform} URL'si.` };
    }
  }
  
  // Pozisyon/ünvan kontrolü
  if (cardData.position && !isNotEmpty(cardData.position)) {
    return { isValid: false, message: 'Pozisyon/ünvan boş olamaz.' };
  }
  
  // Adres kontrolü
  if (cardData.address && cardData.address.length > 500) {
    return { isValid: false, message: 'Adres çok uzun (maksimum 500 karakter).' };
  }
  
  return { isValid: true, message: 'Geçerli' };
};

/**
 * Kullanıcı kayıt verilerini doğrular.
 */
export const validateUserData = (userData: UserData): ValidationResult => {
  // E-posta kontrolü
  if (!isValidEmail(userData.email)) {
    return { isValid: false, message: 'Geçerli bir e-posta adresi girin.' };
  }
  
  // Şifre kontrolü
  if (!isValidPassword(userData.password)) {
    return { 
      isValid: false, 
      message: 'Şifre en az 8 karakter, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.' 
    };
  }
  
  // Ad kontrolü
  if (!isNotEmpty(userData.first_name)) {
    return { isValid: false, message: 'Ad alanı boş olamaz.' };
  }
  
  // Soyad kontrolü
  if (!isNotEmpty(userData.last_name)) {
    return { isValid: false, message: 'Soyad alanı boş olamaz.' };
  }
  
  // Telefon kontrolü (isteğe bağlı)
  if (userData.phone && !isValidPhone(userData.phone)) {
    return { isValid: false, message: 'Geçersiz telefon numarası formatı.' };
  }
  
  return { isValid: true, message: 'Geçerli' };
};

/**
 * Koleksiyon verilerini doğrular.
 */
export const validateCollectionData = (collectionData: CollectionData): ValidationResult => {
  // Koleksiyon adı kontrolü
  if (!isNotEmpty(collectionData.name)) {
    return { isValid: false, message: 'Koleksiyon adı boş olamaz.' };
  }
  
  // Açıklama kontrolü
  if (collectionData.description && collectionData.description.length > 200) {
    return { isValid: false, message: 'Açıklama çok uzun (maksimum 200 karakter).' };
  }
  
  return { isValid: true, message: 'Geçerli' };
};

/**
 * QR kod verisini doğrular.
 */
export const validateQRData = (qrData: string | null | undefined): ValidationResult => {
  if (!qrData || typeof qrData !== 'string') {
    return { isValid: false, message: 'QR kod verisi boş olamaz.' };
  }
  
  if (qrData.length > 1000) {
    return { isValid: false, message: 'QR kod verisi çok uzun.' };
  }
  
  return { isValid: true, message: 'Geçerli' };
};

/**
 * Dosya yükleme verilerini doğrular.
 */
export const validateFileData = (fileData: FileData): ValidationResult => {
  // Dosya boyutu kontrolü (5MB sınırı)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (fileData.size > maxSize) {
    return { isValid: false, message: "Dosya boyutu 5MB'dan küçük olmalıdır." };
  }
  
  // Dosya tipi kontrolü
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(fileData.type)) {
    return { isValid: false, message: 'Sadece JPG, PNG ve WebP formatları destekleniyor.' };
  }
  
  return { isValid: true, message: 'Geçerli' };
};

// ==================== TEXT VALIDATOR ====================

interface TextValidatorOptions extends ValidatorOptions {
  allowEmpty?: boolean;
}

/**
 * Genel metin doğrulama
 */
export const validateText = (text: string | null | undefined, options: TextValidatorOptions = {}): ValidationResult => {
  const {
    minLength = 0,
    maxLength = Infinity,
    required = false,
    pattern = undefined,
    customMessage = undefined,
  } = options;
  const allowEmpty = options.allowEmpty ?? true;
  
  // Boşlukları temizle
  const trimmedText = text ? text.trim() : '';
  
  // Zorunlu alan kontrolü
  if (required && !trimmedText) {
    return { 
      isValid: false, 
      message: customMessage || 'Bu alan zorunludur.' 
    };
  }
  
  // Boş metin kontrolü
  if (!allowEmpty && !trimmedText) {
    return { 
      isValid: false, 
      message: customMessage || 'Bu alan boş bırakılamaz.' 
    };
  }
  
  // Minimum uzunluk kontrolü
  if (trimmedText && trimmedText.length < minLength) {
    return { 
      isValid: false, 
      message: customMessage || `En az ${minLength} karakter gerekli.` 
    };
  }
  
  // Maksimum uzunluk kontrolü
  if (trimmedText && trimmedText.length > maxLength) {
    return { 
      isValid: false, 
      message: customMessage || `En fazla ${maxLength} karakter girebilirsiniz.` 
    };
  }
  
  // Regex pattern kontrolü
  if (trimmedText && pattern && !pattern.test(trimmedText)) {
    return { 
      isValid: false, 
      message: customMessage || 'Geçersiz format.' 
    };
  }
  
  return { isValid: true, message: 'Geçerli' };
};
