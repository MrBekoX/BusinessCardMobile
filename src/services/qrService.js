/**
 * QR kod oluşturma ve vCard formatına dönüştürme servisi.
 */
import Settings from '../config/settings';

/**
 * Kartvizit verisini vCard formatına dönüştürür.
 * @param {object} cardData - Kartvizit verisi.
 * @returns {string} vCard formatında string.
 */
export const generateVCard = (cardData) => {
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
    // Telefon numarasını temizle ve formatla
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

/**
 * Deep link oluşturur.
 * @param {string} cardId - Kartvizit ID.
 * @returns {string} Deep link URL.
 */
export const generateDeepLink = (cardId) => {
  return `${Settings.deepLinking.scheme}://card/${cardId}`;
};

/**
 * QR kod için veri hazırlar.
 * @param {object} cardData - Kartvizit verisi.
 * @param {string} type - 'vcard' veya 'deeplink'.
 * @returns {string} QR kod verisi.
 */
export const prepareQRData = (cardData, type = 'deeplink') => {
  if (type === 'vcard') {
    return generateVCard(cardData);
  } else {
    return generateDeepLink(cardData.id);
  }
};

/**
 * QR kod okuma sonucunu parse eder.
 * @param {string} data - QR kod verisi.
 * @returns {object} Parse edilmiş veri.
 */
export const parseQRData = (data) => {
  // vCard mı kontrol et
  if (data.startsWith('BEGIN:VCARD')) {
    return {
      type: 'vcard',
      data: parseVCard(data),
    };
  }
  
  // Deep link mi kontrol et
  if (data.startsWith(Settings.deepLinking.scheme)) {
    const cardId = data.split('/').pop();
    return {
      type: 'deeplink',
      cardId,
    };
  }
  
  // URL mi kontrol et
  if (data.startsWith('http')) {
    return {
      type: 'url',
      data,
    };
  }
  
  // Sosyal medya linki mi kontrol et
  const socialPatterns = {
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

/**
 * vCard stringini parse eder.
 * @param {string} vCardString - vCard formatında string.
 * @returns {object} Parse edilmiş kartvizit verisi.
 */
const parseVCard = (vCardString) => {
  const lines = vCardString.split('\n');
  const cardData = {};
  
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
          default:
            cardData[`${platform}_url`] = url;
        }
      }
    }
  });
  
  return cardData;
};

/**
 * QR kod boyutunu hesaplar
 * @param {string} data - QR kod verisi
 * @returns {number} Önerilen boyut
 */
export const calculateQRSize = (data) => {
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
 * @param {string} data - QR kod verisi
 * @returns {string} Hata düzeyi (L, M, Q, H)
 */
export const getErrorCorrectionLevel = (data) => {
  const dataLength = data.length;
  
  // Veri uzunluğuna göre hata düzeltme seviyesi
  if (dataLength > 300) {
    return 'H'; // Yüksek hata düzeltme
  } else if (dataLength > 150) {
    return 'Q'; // Çeyrek hata düzeltme
  } else if (dataLength > 50) {
    return 'M'; // Orta hata düzeltme (varsayılan)
  }
  
  return Settings.qr.errorCorrectionLevel; // L - Düşük hata düzeltme
};

/**
 * QR kod renk şemasını oluşturur
 * @param {boolean} isDark - Koyu mod mu
 * @returns {object} Renk şeması
 */
export const getQRColorScheme = (isDark) => {
  return {
    backgroundColor: isDark ? '#000000' : Settings.qr.backgroundColor,
    foregroundColor: isDark ? '#FFFFFF' : Settings.qr.foregroundColor,
  };
};

/**
 * QR kod meta verilerini oluşturur
 * @param {object} cardData - Kartvizit verisi
 * @returns {object} QR kod meta verileri
 */
export const generateQRMetaData = (cardData) => {
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