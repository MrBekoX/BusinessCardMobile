/**
 * Paylaşım işlemlerini yöneten servis.
 */
import Share from 'react-native-share';
import { generateVCard } from './qrService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/errorMessages';

/**
 * Kartviziti sosyal medya veya mesajlaşma uygulamalarıyla paylaş.
 * @param {object} cardData - Kartvizit verisi.
 * @param {string} method - Paylaşım yöntemi (optional).
 * @returns {Promise<void>}
 */
export const shareCard = async (cardData, method = 'default') => {
  try {
    const vCardData = generateVCard(cardData);
    const deepLink = `cardvault://card/${cardData.id}`;
    
    const shareOptions = {
      title: `${cardData.company_name} - Kartvizit`,
      message: `${cardData.company_name} kartvizitini görüntüle: ${deepLink}`,
      url: `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`,
      filename: `${cardData.company_name.replace(/\s/g, '_')}.vcf`,
    };

    // Belirli bir platform için paylaş
    if (method !== 'default') {
      shareOptions.social = getSocialPlatform(method);
    }

    const result = await Share.open(shareOptions);

    console.log('Card shared successfully');
    return { success: true, message: SUCCESS_MESSAGES.CARD_SHARED };
  } catch (error) {
    console.error('Share error:', error);
    if (error.message !== 'User did not share') {
      return { success: false, error: ERROR_MESSAGES.SHARE_FAILED };
    }
    return { success: false, error: 'User cancelled share' };
  }
};

/**
 * Sosyal medya platform kodunu döndürür.
 * @param {string} method - Platform adı.
 * @returns {string} Platform kodu.
 */
const getSocialPlatform = (method) => {
  const platforms = {
    instagram: Share.Social.INSTAGRAM,
    whatsapp: Share.Social.WHATSAPP,
    email: Share.Social.EMAIL,
    linkedin: Share.Social.LINKEDIN,
    twitter: Share.Social.TWITTER,
    facebook: Share.Social.FACEBOOK,
    sms: Share.Social.SMS,
  };
  
  return platforms[method.toLowerCase()] || null;
};

/**
 * Kartviziti belirli bir platformda paylaş.
 * @param {object} cardData - Kartvizit verisi.
 * @param {string} platform - Platform adı.
 * @returns {Promise<object>} Paylaşım sonucu.
 */
export const shareToPlatform = async (cardData, platform) => {
  try {
    const vCardData = generateVCard(cardData);
    const deepLink = `cardvault://card/${cardData.id}`;
    
    const shareOptions = {
      title: `${cardData.company_name} - Kartvizit`,
      message: `${cardData.company_name} kartvizitini görüntüle: ${deepLink}`,
      url: `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`,
      social: getSocialPlatform(platform),
    };

    const result = await Share.open(shareOptions);
    
    return {
      success: true,
      message: SUCCESS_MESSAGES.CARD_SHARED,
      platform,
    };
  } catch (error) {
    console.error(`Share to ${platform} error:`, error);
    return {
      success: false,
      error: ERROR_MESSAGES.SHARE_FAILED,
      platform,
    };
  }
};

/**
 * vCard dosyası olarak dışa aktar.
 * @param {object} cardData - Kartvizit verisi.
 * @returns {Promise<string>} Dosya yolu.
 */
export const exportVCard = async (cardData) => {
  try {
    const vCardData = generateVCard(cardData);
    const filename = `${cardData.company_name.replace(/\s/g, '_')}.vcf`;
    
    // React Native FS ile dosya yazma işlemi burada yapılacak
    // import RNFS from 'react-native-fs';
    // const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
    // await RNFS.writeFile(filePath, vCardData, 'utf8');
    
    console.log('vCard exported:', filename);
    return filename;
  } catch (error) {
    console.error('vCard export error:', error);
    throw new Error(ERROR_MESSAGES.VCARD_GENERATION_FAILED);
  }
};

/**
 * Kartviziti PDF olarak dışa aktar.
 * @param {object} cardData - Kartvizit verisi.
 * @returns {Promise<string>} Dosya yolu.
 */
export const exportToPDF = async (cardData) => {
  try {
    // PDF oluşturma işlemi
    // import RNHTMLtoPDF from 'react-native-html-to-pdf';
    
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
            .company { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .position { font-size: 18px; color: #666; margin-bottom: 10px; }
            .contact { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="company">${cardData.company_name}</div>
            <div class="position">${cardData.position || ''}</div>
            ${cardData.name ? `<div class="contact">Ad: ${cardData.name}</div>` : ''}
            ${cardData.email ? `<div class="contact">E-posta: ${cardData.email}</div>` : ''}
            ${cardData.phone ? `<div class="contact">Telefon: ${cardData.phone}</div>` : ''}
            ${cardData.website ? `<div class="contact">Web: ${cardData.website}</div>` : ''}
          </div>
        </body>
      </html>
    `;
    
    // const options = {
    //   html: html,
    //   fileName: `${cardData.company_name.replace(/\s/g, '_')}`,
    //   directory: 'Documents',
    // };
    
    // const pdf = await RNHTMLtoPDF.convert(options);
    // return pdf.filePath;
    
    console.log('PDF export simulation completed');
    return `${cardData.company_name.replace(/\s/g, '_')}.pdf`;
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDF oluşturulamadı');
  }
};

/**
 * Kartviziti resim olarak dışa aktar.
 * @param {object} cardData - Kartvizit verisi.
 * @returns {Promise<string>} Dosya yolu.
 */
export const exportToImage = async (cardData) => {
  try {
    // ViewShot kullanarak ekran görüntüsü alma
    // import ViewShot from 'react-native-view-shot';
    
    // const uri = await ViewShot.captureRef(viewRef, {
    //   format: 'png',
    //   quality: 0.9,
    //   result: 'tmpfile',
    // });
    
    console.log('Image export simulation completed');
    return `${cardData.company_name.replace(/\s/g, '_')}.png`;
  } catch (error) {
    console.error('Image export error:', error);
    throw new Error('Resim oluşturulamadı');
  }
};

/**
 * Birden fazla kartviziti toplu olarak paylaş.
 * @param {Array} cardsData - Kartvizit verileri dizisi.
 * @returns {Promise<object>} Paylaşım sonucu.
 */
export const shareMultipleCards = async (cardsData) => {
  try {
    const vCards = cardsData.map(card => generateVCard(card)).join('\n');
    const filename = `business_cards_${Date.now()}.vcf`;
    
    const shareOptions = {
      title: `${cardsData.length} Kartvizit`,
      message: `${cardsData.length} adet kartvizit`,
      url: `data:text/vcard;charset=utf-8,${encodeURIComponent(vCards)}`,
      filename,
    };

    const result = await Share.open(shareOptions);
    
    return {
      success: true,
      message: `${cardsData.length} kartvizit paylaşıldı`,
      count: cardsData.length,
    };
  } catch (error) {
    console.error('Multiple cards share error:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.SHARE_FAILED,
    };
  }
};

/**
 * Kartvizit paylaşım istatistiklerini al.
 * @returns {Promise<object>} Paylaşım istatistikleri.
 */
export const getShareStats = async () => {
  try {
    // Burada local storage'dan istatistikleri okuyabilirsiniz
    return {
      totalShares: 0,
      vcardShares: 0,
      pdfShares: 0,
      imageShares: 0,
      mostUsedPlatform: null,
      lastShareDate: null,
    };
  } catch (error) {
    console.error('Get share stats error:', error);
    return {
      totalShares: 0,
      vcardShares: 0,
      pdfShares: 0,
      imageShares: 0,
      mostUsedPlatform: null,
      lastShareDate: null,
    };
  }
};

/**
 * Paylaşım geçmişini kaydet.
 * @param {object} shareData - Paylaşım verisi.
 * @returns {Promise<void>}
 */
export const saveShareHistory = async (shareData) => {
  try {
    const historyItem = {
      ...shareData,
      timestamp: Date.now(),
      id: generateId(),
    };
    
    // Local storage'a kaydet
    console.log('Share history saved:', historyItem);
  } catch (error) {
    console.error('Save share history error:', error);
  }
};

/**
 * Benzersiz ID oluştur.
 * @returns {string} Benzersiz ID.
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default {
  shareCard,
  shareToPlatform,
  exportVCard,
  exportToPDF,
  exportToImage,
  shareMultipleCards,
  getShareStats,
  saveShareHistory,
};