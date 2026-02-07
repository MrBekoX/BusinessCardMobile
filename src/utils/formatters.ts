/**
 * Veri formatlama ve dönüştürme fonksiyonları.
 */

// ==================== PHONE & EMAIL FORMATTERS ====================

/**
 * Telefon numarasını formatlar (Türkiye formatı).
 */
export const formatPhone = (phone: string | null | undefined): string => {
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
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const maskedLocal = localPart.length > 2 
    ? localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.slice(-1)
    : '*'.repeat(localPart.length);
    
  return `${maskedLocal}@${domain}`;
};

// ==================== STRING FORMATTERS ====================

/**
 * İsim ve soyismi baş harfleri büyük olacak şekilde formatlar.
 */
export const formatName = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Metni belirli bir uzunlukta keser ve ... ekler.
 */
export const truncateText = (text: string | null | undefined, maxLength = 100): string => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * İsimden baş harfleri oluşturur.
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return '';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
};

/**
 * Metinden HTML etiketlerini kaldırır.
 */
export const stripHtml = (html: string | null | undefined): string => {
  if (!html || typeof html !== 'string') return '';
  
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Metni URL dostu hale getirir (slug).
 */
export const createSlug = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ==================== DATE & TIME FORMATTERS ====================

/**
 * Tarihi okunabilir formatta gösterir.
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
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
 */
export const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ==================== NUMBER FORMATTERS ====================

/**
 * Dosya boyutunu okunabilir formatta gösterir.
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Sayıyı binlik ayraçlarla formatlar.
 */
export const formatNumber = (number: number | null | undefined): string => {
  if (number === null || number === undefined) return '';
  
  return new Intl.NumberFormat('tr-TR').format(number);
};

/**
 * Para birimini formatlar.
 */
export const formatCurrency = (amount: number | null | undefined, currency = 'TRY'): string => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Yüzdeyi formatlar.
 */
export const formatPercentage = (percentage: number | null | undefined): string => {
  if (percentage === null || percentage === undefined) return '';
  
  return `${percentage.toFixed(1)}%`;
};

// ==================== URL FORMATTERS ====================

/**
 * URL'yi kısaltır.
 */
export const shortenUrl = (url: string | null | undefined, maxLength = 50): string => {
  if (!url || typeof url !== 'string') return '';
  
  // Protokolü kaldır
  const cleanUrl = url.replace(/^https?:\/\//, '');
  
  if (cleanUrl.length <= maxLength) return cleanUrl;
  
  return cleanUrl.substring(0, maxLength - 3) + '...';
};

// ==================== POSITION & PLATFORM FORMATTERS ====================

/**
 * Kartvizit pozisyonunu formatlar.
 */
export const formatPosition = (position: string | null | undefined): string => {
  if (!position || typeof position !== 'string') return '';
  
  const positionMap: Record<string, string> = {
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
 */
export const formatSocialPlatform = (platform: string | null | undefined): string => {
  if (!platform || typeof platform !== 'string') return '';
  
  const platformMap: Record<string, string> = {
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

// ==================== COLOR UTILITIES ====================

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Renk kodunu RGB'ye dönüştürür.
 */
export const hexToRgb = (hex: string | null | undefined): RGB | null => {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * RGB'yi hex renk koduna dönüştürür.
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Renk parlaklığını hesaplar.
 */
export const getBrightness = (color: string | null | undefined): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
};

/**
 * Arkaplan rengine göre kontrast renk seçer.
 */
export const getContrastColor = (backgroundColor: string | null | undefined): string => {
  const brightness = getBrightness(backgroundColor);
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Rastgele renk üretir.
 */
export const generateRandomColor = (seed = ''): string => {
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

// ==================== PASSWORD STRENGTH ====================

interface PasswordStrength {
  score: number;
  maxScore: number;
  label: string;
  color: string;
  feedback: string[];
  isStrong: boolean;
}

/**
 * Şifre gücünü değerlendirir.
 */
export const getPasswordStrength = (password: string | null | undefined): PasswordStrength => {
  if (!password || typeof password !== 'string') {
    return { score: 0, maxScore: 6, label: 'Çok Zayıf', color: '#FF3B30', feedback: [], isStrong: false };
  }
  
  let score = 0;
  const feedback: string[] = [];
  
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
  let label: string;
  let color: string;
  
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
    score,
    maxScore: 6,
    label,
    color,
    feedback,
    isStrong: score >= 4
  };
};
