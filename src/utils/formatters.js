/**
 * Veri formatlama ve dönüştürme fonksiyonları.
 */

/**
 * Telefon numarasını formatlar (Türkiye formatı).
 * @param {string} phone - Formatlanacak telefon numarası.
 * @returns {string} Formatlanmış telefon numarası.
 */
export const formatPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Sadece rakamları al
  const digits = phone.replace(/\D/g, '');
  
  // Türkiye formatına göre düzenle
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  
  if (digits.length === 10 && digits.startsWith('5')) {
    return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '0$1 $2 $3 $4');
  }
  
  if (digits.length === 12 && digits.startsWith('90')) {
    return `+${digits.replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;
  }
  
  return phone;
};

/**
 * E-posta adresini gizler.
 * @param {string} email - Gizlenecek e-posta adresi.
 * @returns {string} Gizlenmiş e-posta adresi.
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const maskedLocal = localPart.length > 2 
    ? localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.slice(-1)
    : '*'.repeat(localPart.length);
    
  return `${maskedLocal}@${domain}`;
};

/**
 * İsim ve soyismi baş harfleri büyük olacak şekilde formatlar.
 * @param {string} name - Formatlanacak isim.
 * @returns {string} Formatlanmış isim.
 */
export const formatName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Metni belirli bir uzunlukta keser ve ... ekler.
 * @param {string} text - Kesilecek metin.
 * @param {number} maxLength - Maksimum uzunluk.
 * @returns {string} Kısaltılmış metin.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Tarihi okunabilir formatta gösterir.
 * @param {Date|string} date - Formatlanacak tarih.
 * @returns {string} Formatlanmış tarih.
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Bugün
  if (diffDays === 1 && now.toDateString() === dateObj.toDateString()) {
    return 'Bugün';
  }
  
  // Dün
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === dateObj.toDateString()) {
    return 'Dün';
  }
  
  // Bu hafta
  if (diffDays <= 7) {
    return `${diffDays} gün önce`;
  }
  
  // Bu ay
  if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hafta önce`;
  }
  
  // Uzun tarih formatı
  return dateObj.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Saati formatlar.
 * @param {Date|string} date - Formatlanacak saat.
 * @returns {string} Formatlanmış saat.
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Dosya boyutunu okunabilir formatta gösterir.
 * @param {number} bytes - Byte cinsinden dosya boyutu.
 * @returns {string} Formatlanmış dosya boyutu.
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * URL'yi kısaltır.
 * @param {string} url - Kısaltılacak URL.
 * @param {number} maxLength - Maksimum uzunluk.
 * @returns {string} Kısaltılmış URL.
 */
export const shortenUrl = (url, maxLength = 50) => {
  if (!url || typeof url !== 'string') return '';
  
  // Protokolü kaldır
  const cleanUrl = url.replace(/^https?:\/\//, '');
  
  if (cleanUrl.length <= maxLength) return cleanUrl;
  
  return cleanUrl.substring(0, maxLength - 3) + '...';
};

/**
 * Sayıyı binlik ayraçlarla formatlar.
 * @param {number} number - Formatlanacak sayı.
 * @returns {string} Formatlanmış sayı.
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '';
  
  return new Intl.NumberFormat('tr-TR').format(number);
};

/**
 * Para birimini formatlar.
 * @param {number} amount - Tutar.
 * @param {string} currency - Para birimi (varsayılan: TRY).
 * @returns {string} Formatlanmış para birimi.
 */
export const formatCurrency = (amount, currency = 'TRY') => {
  if (!amount && amount !== 0) return '';
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Yüzdeyi formatlar.
 * @param {number} percentage - Yüzde değeri.
 * @returns {string} Formatlanmış yüzde.
 */
export const formatPercentage = (percentage) => {
  if (!percentage && percentage !== 0) return '';
  
  return `${percentage.toFixed(1)}%`;
};

/**
 * Kartvizit pozisyonunu formatlar.
 * @param {string} position - Pozisyon/ünvan.
 * @returns {string} Formatlanmış pozisyon.
 */
export const formatPosition = (position) => {
  if (!position || typeof position !== 'string') return '';
  
  const positionMap = {
    'ceo': 'CEO',
    'cfo': 'CFO',
    'coo': 'COO',
    'cto': 'CTO',
    'manager': 'Müdür',
    'director': 'Direktör',
    'consultant': 'Danışman',
    'engineer': 'Mühendis',
    'developer': 'Geliştirici',
    'designer': 'Tasarımcı',
    'sales': 'Satış Temsilcisi',
    'marketing': 'Pazarlama Uzmanı',
    'hr': 'İK Uzmanı',
  };
  
  const lowerPosition = position.toLowerCase();
  return positionMap[lowerPosition] || formatName(position);
};

/**
 * Sosyal medya platform adını formatlar.
 * @param {string} platform - Platform adı.
 * @returns {string} Formatlanmış platform adı.
 */
export const formatSocialPlatform = (platform) => {
  if (!platform || typeof platform !== 'string') return '';
  
  const platformMap = {
    'instagram': 'Instagram',
    'linkedin': 'LinkedIn',
    'x': 'X (Twitter)',
    'twitter': 'Twitter',
    'youtube': 'YouTube',
    'facebook': 'Facebook',
    'whatsapp': 'WhatsApp',
    'tiktok': 'TikTok',
  };
  
  const lowerPlatform = platform.toLowerCase();
  return platformMap[lowerPlatform] || formatName(platform);
};

/**
 * Renk kodunu RGB'ye dönüştürür.
 * @param {string} hex - Hex renk kodu.
 * @returns {object} RGB değerleri.
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * RGB'yi hex renk koduna dönüştürür.
 * @param {number} r - Kırmızı değeri.
 * @param {number} g - Yeşil değeri.
 * @param {number} b - Mavi değeri.
 * @returns {string} Hex renk kodu.
 */
export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Renk parlaklığını hesaplar.
 * @param {string} color - Renk kodu.
 * @returns {number} Parlaklık değeri.
 */
export const getBrightness = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
};

/**
 * Arkaplan rengine göre kontrast renk seçer.
 * @param {string} backgroundColor - Arka plan rengi.
 * @returns {string} Kontrast renk (siyah veya beyaz).
 */
export const getContrastColor = (backgroundColor) => {
  const brightness = getBrightness(backgroundColor);
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * İsimden baş harfleri oluşturur.
 * @param {string} name - İsim.
 * @returns {string} Baş harfler.
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
};

/**
 * Rastgele renk üretir.
 * @param {string} seed - Renk üretmek için tohum.
 * @returns {string} Hex renk kodu.
 */
export const generateRandomColor = (seed = '') => {
  let hash = 0;
  
  if (seed) {
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
  } else {
    hash = Math.floor(Math.random() * 16777215);
  }
  
  const r = (hash >> 16) & 255;
  const g = (hash >> 8) & 255;
  const b = hash & 255;
  
  return rgbToHex(r, g, b);
};

/**
 * Metinden HTML etiketlerini kaldırır.
 * @param {string} html - HTML içerik.
 * @returns {string} Düz metin.
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Metni URL dostu hale getirir (slug).
 * @param {string} text - Metin.
 * @returns {string} URL dostu metin.
 */
export const createSlug = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Şifre gücünü değerlendirir.
 * @param {string} password - Şifre.
 * @returns {object} Şifre gücü bilgisi.
 */
export const getPasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { score: 0, label: 'Çok Zayıf', color: '#FF3B30' };
  }
  
  let score = 0;
  let feedback = [];
  
  // Uzunluk kontrolü
  if (password.length >= 8) score += 1;
  else feedback.push('En az 8 karakter');
  
  if (password.length >= 12) score += 1;
  
  // Büyük harf kontrolü
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Büyük harf');
  
  // Küçük harf kontrolü
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Küçük harf');
  
  // Rakam kontrolü
  if (/\d/.test(password)) score += 1;
  else feedback.push('Rakam');
  
  // Özel karakter kontrolü
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push('Özel karakter');
  
  // Skora göre değerlendirme
  let label, color;
  if (score <= 1) {
    label = 'Çok Zayıf';
    color = '#FF3B30';
  } else if (score <= 2) {
    label = 'Zayıf';
    color = '#FF9500';
  } else if (score <= 3) {
    label = 'Orta';
    color = '#FFCC02';
  } else if (score <= 4) {
    label = 'Güçlü';
    color = '#34C759';
  } else {
    label = 'Çok Güçlü';
    color = '#30D158';
  }
  
  return {
    score: score,
    maxScore: 6,
    label: label,
    color: color,
    feedback: feedback,
    isStrong: score >= 4
  };
};