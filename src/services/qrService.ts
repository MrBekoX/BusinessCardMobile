/**
 * QR kod oluşturma ve vCard formatına dönüştürme servisi.
 */
import Settings from '@config/settings';
import { Card } from '@/types';

// ==================== TYPES ====================

interface VCardData {
  company_name?: string;
  position?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  name?: string;
  linkedin_url?: string;
  instagram_url?: string;
  x_url?: string;
  twitter_url?: string;
  youtube_url?: string;
}

interface ParsedQRData {
  type: 'vcard' | 'deeplink' | 'url' | 'social' | 'email' | 'phone' | 'text';
  data?: VCardData | string;
  cardId?: string;
  platform?: string;
}

interface QRColorScheme {
  backgroundColor: string;
  foregroundColor: string;
}

interface QRMetaData {
  id: string;
  type: string;
  version: string;
  created: string;
  source: string;
}

// ==================== VCARD GENERATION ====================

/**
 * Kartvizit verisini vCard formatına dönüştürür.
 */
export const generateVCard = (cardData: VCardData): string => {
  const {
    company_name,
    position,
    phone,
    email,
    address,
    website,
    name,
  } = cardData;

  // vCard 3.0 formatı
  let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
  
  // İsim ve firma bilgisi
  if (name) {
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    vCard += `FN:${name}\n`;
    vCard += `N:${lastName};${firstName};;;\n`;
  } else if (company_name) {
    vCard += `FN:${company_name}\n`;
    vCard += `ORG:${company_name}\n`;
  }
  
  // Ünvan/pozisyon
  if (position) {
    vCard += `TITLE:${position}\n`;
  }
  
  // Telefon
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    vCard += `TEL;TYPE=CELL:${cleanPhone}\n`;
  }
  
  // E-posta
  if (email) {
    vCard += `EMAIL;TYPE=WORK:${email}\n`;
  }
  
  // Adres
  if (address) {
    vCard += `ADR;TYPE=WORK:;;${address.replace(/,/g, '\\,')};;;\n`;
  }
  
  // Web sitesi
  if (website) {
    vCard += `URL:${website}\n`;
  }
  
  // Sosyal medya bağlantıları
  if (cardData.linkedin_url) {
    vCard += `X-SOCIALPROFILE;TYPE=linkedin:${cardData.linkedin_url}\n`;
  }
  
  if (cardData.instagram_url) {
    vCard += `X-SOCIALPROFILE;TYPE=instagram:${cardData.instagram_url}\n`;
  }
  
  if (cardData.x_url || cardData.twitter_url) {
    const twitterUrl = cardData.x_url || cardData.twitter_url;
    vCard += `X-SOCIALPROFILE;TYPE=twitter:${twitterUrl}\n`;
  }
  
  if (cardData.youtube_url) {
    vCard += `X-SOCIALPROFILE;TYPE=youtube:${cardData.youtube_url}\n`;
  }
  
  vCard += 'END:VCARD';
  
  return vCard;
};

// ==================== DEEP LINK ====================

/**
 * Deep link oluşturur.
 */
export const generateDeepLink = (cardId: string): string => {
  return `${Settings.deepLinking.scheme}://card/${cardId}`;
};

/**
 * QR kod için veri hazırlar.
 */
export const prepareQRData = (
  cardData: Card,
  type: 'vcard' | 'deeplink' = 'deeplink'
): string => {
  if (type === 'vcard') {
    return generateVCard(cardData);
  }
  return generateDeepLink(cardData.id);
};

// ==================== QR PARSING ====================

/**
 * vCard stringini parse eder.
 */
const parseVCard = (vCardString: string): VCardData => {
  const lines = vCardString.split('\n');
  const cardData: VCardData = {};
  
  lines.forEach(line => {
    // FN (Full Name)
    if (line.startsWith('FN:')) {
      cardData.name = line.substring(3);
    }
    
    // N (Name)
    if (line.startsWith('N:')) {
      const nameParts = line.substring(2).split(';');
      if (nameParts[0] || nameParts[1]) {
        cardData.name = `${nameParts[1]} ${nameParts[0]}`.trim();
      }
    }
    
    // ORG (Organization)
    if (line.startsWith('ORG:')) {
      cardData.company_name = line.substring(4);
    }
    
    // TITLE
    if (line.startsWith('TITLE:')) {
      cardData.position = line.substring(6);
    }
    
    // TEL
    if (line.startsWith('TEL')) {
      const telMatch = line.match(/TEL.*:(.+)/);
      if (telMatch) {
        cardData.phone = telMatch[1];
      }
    }
    
    // EMAIL
    if (line.startsWith('EMAIL')) {
      const emailMatch = line.match(/EMAIL.*:(.+)/);
      if (emailMatch) {
        cardData.email = emailMatch[1];
      }
    }
    
    // ADR
    if (line.startsWith('ADR')) {
      const adrMatch = line.match(/ADR.*:(.+)/);
      if (adrMatch) {
        cardData.address = adrMatch[1].replace(/\\,/g, ',');
      }
    }
    
    // URL
    if (line.startsWith('URL:')) {
      cardData.website = line.substring(4);
    }
    
    // X-SOCIALPROFILE
    if (line.startsWith('X-SOCIALPROFILE')) {
      const socialMatch = line.match(/X-SOCIALPROFILE.*TYPE=(\w+):(.+)/);
      if (socialMatch) {
        const platform = socialMatch[1];
        const url = socialMatch[2];
        
        switch (platform.toLowerCase()) {
          case 'linkedin':
            cardData.linkedin_url = url;
            break;
          case 'instagram':
            cardData.instagram_url = url;
            break;
          case 'twitter':
          case 'x':
            cardData.x_url = url;
            break;
          case 'youtube':
            cardData.youtube_url = url;
            break;
        }
      }
    }
  });
  
  return cardData;
};

/**
 * QR kod okuma sonucunu parse eder.
 */
export const parseQRData = (data: string): ParsedQRData => {
  // vCard mı kontrol et
  if (data.startsWith('BEGIN:VCARD')) {
    return {
      type: 'vcard',
      data: parseVCard(data),
    };
  }
  
  // Deep link mi kontrol et
  if (data.startsWith(Settings.deepLinking.scheme)) {
    const cardId = data.split('/').pop() || '';
    return {
      type: 'deeplink',
      cardId,
    };
  }
  
  // URL mi kontrol et
  if (data.startsWith('http')) {
    // Sosyal medya linki mi kontrol et
    const socialPatterns: Record<string, RegExp> = {
      instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/,
      twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/,
      youtube: /^https?:\/\/(www\.)?youtube\.com\/.+/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/,
    };
    
    for (const [platform, pattern] of Object.entries(socialPatterns)) {
      if (pattern.test(data)) {
        return {
          type: 'social',
          platform,
          data,
        };
      }
    }
    
    return {
      type: 'url',
      data,
    };
  }
  
  // E-posta mı kontrol et
  if (data.includes('@') && data.includes('.')) {
    return {
      type: 'email',
      data,
    };
  }
  
  // Telefon numarası mı kontrol et
  if (/^\+?[\d\s-()]+$/.test(data)) {
    return {
      type: 'phone',
      data,
    };
  }
  
  return {
    type: 'text',
    data,
  };
};

// ==================== QR UTILITIES ====================

/**
 * QR kod boyutunu hesaplar
 */
export const calculateQRSize = (data: string): number => {
  const baseSize = Settings.qr.size;
  const dataLength = data.length;
  
  // Veri uzunluğuna göre boyut ayarlama
  if (dataLength > 500) {
    return Math.min(baseSize * 1.5, 400); // Maksimum 400px
  } else if (dataLength > 200) {
    return baseSize * 1.2;
  }
  
  return baseSize;
};

/**
 * QR kod hata düzeyini belirler
 */
export const getErrorCorrectionLevel = (data: string): 'L' | 'M' | 'Q' | 'H' => {
  const dataLength = data.length;
  
  // Veri uzunluğuna göre hata düzeltme seviyesi
  if (dataLength > 300) {
    return 'H'; // Yüksek hata düzeltme
  } else if (dataLength > 150) {
    return 'Q'; // Çeyrek hata düzeltme
  } else if (dataLength > 50) {
    return 'M'; // Orta hata düzeltme (varsayılan)
  }
  
  return Settings.qr.errorCorrectionLevel;
};

/**
 * QR kod renk şemasını oluşturur
 */
export const getQRColorScheme = (isDark: boolean): QRColorScheme => {
  return {
    backgroundColor: isDark ? '#000000' : Settings.qr.backgroundColor,
    foregroundColor: isDark ? '#FFFFFF' : Settings.qr.foregroundColor,
  };
};

/**
 * QR kod meta verilerini oluşturur
 */
export const generateQRMetaData = (cardData: Card): QRMetaData => {
  return {
    id: cardData.id,
    type: 'business-card',
    version: '1.0',
    created: new Date().toISOString(),
    source: 'cardvault',
  };
};

export default {
  generateVCard,
  generateDeepLink,
  prepareQRData,
  parseQRData,
  calculateQRSize,
  getErrorCorrectionLevel,
  getQRColorScheme,
  generateQRMetaData,
};
