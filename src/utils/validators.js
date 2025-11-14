/**
 * Girdi doğrulama fonksiyonları.
 * Supabase'e veri göndermeden önce mutlaka kullanılmalıdır.
 */

/**
 * E-posta formatını doğrular.
 * @param {string} email - Doğrulanacak e-posta adresi.
 * @returns {boolean} E-posta geçerliyse true döner.
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Şifrenin minimum gereksinimleri karşılayıp karşılamadığını kontrol eder.
 * @param {string} password - Doğrulanacak şifre.
 * @returns {boolean} Şifre geçerliyse true döner (min. 8 karakter).
 */
export const isValidPassword = (password) => {
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
 * @param {string} text - Doğrulanacak metin.
 * @returns {boolean} Metin geçerliyse true döner.
 */
export const isNotEmpty = (text) => {
  return text && typeof text === 'string' && text.trim().length > 0;
};

/**
 * Telefon numarası formatını doğrular (Türkiye standartı).
 * @param {string} phone - Doğrulanacak telefon numarası.
 * @returns {boolean} Telefon geçerliyse true döner.
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Türk telefon formatı: +90 5XX XXX XX XX veya 05XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * URL formatını doğrular.
 * @param {string} url - Doğrulanacak URL.
 * @returns {boolean} URL geçerliyse true döner.
 */
export const isValidUrl = (url) => {
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

/**
 * Sosyal medya URL'sinin platforma uygun olup olmadığını kontrol eder.
 * @param {string} url - Kontrol edilecek URL.
 * @param {string} platform - Platform adı ('instagram', 'linkedin', 'x', 'youtube').
 * @returns {boolean} URL platforma uygunsa true döner.
 */
export const isValidSocialUrl = (url, platform) => {
  if (!isValidUrl(url)) return false;
  
  const patterns = {
    instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/,
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+/,
    x: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/,
    youtube: /^https?:\/\/(www\.)?youtube\.com\/(channel|c|user)\/.+/,
    facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/,
    whatsapp: /^https?:\/\/(www\.)?wa\.me\/.+/,
  };
  
  return patterns[platform]?.test(url) || false;
};

/**
 * Kartvizit nesnesinin gerekli alanları içerip içermediğini doğrular.
 * @param {object} cardData - Kartvizit verisi.
 * @returns {{isValid: boolean, message: string}} Doğrulama sonucu.
 */
export const validateCardData = (cardData) => {
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
  const socialPlatforms = ['instagram_url', 'linkedin_url', 'x_url', 'youtube_url', 'facebook_url'];
  for (const platform of socialPlatforms) {
    if (cardData[platform] && !isValidSocialUrl(cardData[platform], platform.replace('_url', ''))) {
      return { isValid: false, message: `Geçersiz ${platform.replace('_url', '')} URL'si.` };
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
 * @param {object} userData - Kullanıcı verisi.
 * @returns {{isValid: boolean, message: string}} Doğrulama sonucu.
 */
export const validateUserData = (userData) => {
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
 * @param {object} collectionData - Koleksiyon verisi.
 * @returns {{isValid: boolean, message: string}} Doğrulama sonucu.
 */
export const validateCollectionData = (collectionData) => {
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
 * @param {string} qrData - QR kod verisi.
 * @returns {{isValid: boolean, message: string}} Doğrulama sonucu.
 */
export const validateQRData = (qrData) => {
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
 * @param {object} fileData - Dosya verisi.
 * @returns {{isValid: boolean, message: string}} Doğrulama sonucu.
 */
export const validateFileData = (fileData) => {
  // Dosya boyutu kontrolü (5MB sınırı)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (fileData.size > maxSize) {
    return { isValid: false, message: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' };
  }
  
  // Dosya tipi kontrolü
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(fileData.type)) {
    return { isValid: false, message: 'Sadece JPG, PNG ve WebP formatları destekleniyor.' };
  }
  
  return { isValid: true, message: 'Geçerli' };
};

/**
 * Genel metin doğrulama
 * @param {string} text - Doğrulanacak metin
 * @param {object} options - Doğrulama seçenekleri
 * @returns {{isValid: boolean, message: string}} Doğrulama sonucu
 */
export const validateText = (text, options = {}) => {
  const {
    minLength = 0,
    maxLength = Infinity,
    required = false,
    allowEmpty = true,
    pattern = null,
    customMessage = null
  } = options;
  
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