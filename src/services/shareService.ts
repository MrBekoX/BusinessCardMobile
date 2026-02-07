/**
 * Paylaşım işlemlerini yöneten servis.
 */
import Share from 'react-native-share';
import { generateVCard } from './qrService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@config/errorMessages';
import { Card, ServiceResponse } from '@/types';

// ==================== TYPES ====================

interface ShareOptions {
  title: string;
  message: string;
  url: string;
  filename?: string;
  social?: unknown;
}

interface ShareResult extends ServiceResponse<void> {
  platform?: string;
  count?: number;
}

interface ShareStats {
  totalShares: number;
  vcardShares: number;
  pdfShares: number;
  imageShares: number;
  mostUsedPlatform: string | null;
  lastShareDate: string | null;
}

interface ShareHistoryItem {
  id: string;
  cardId?: string;
  platform?: string;
  type: string;
  timestamp: number;
}

type ShareMethod = 'default' | 'instagram' | 'whatsapp' | 'email' | 'linkedin' | 'twitter' | 'facebook' | 'sms';

// ==================== HELPERS ====================

/**
 * Sosyal medya platform kodunu döndürür.
 */
const getSocialPlatform = (method: ShareMethod) => {
  const platforms = {
    default: null,
    instagram: Share.Social.INSTAGRAM,
    whatsapp: Share.Social.WHATSAPP,
    email: Share.Social.EMAIL,
    linkedin: Share.Social.LINKEDIN,
    twitter: Share.Social.TWITTER,
    facebook: Share.Social.FACEBOOK,
    sms: Share.Social.SMS,
  };
  
  return platforms[method] || null;
};

/**
 * Benzersiz ID oluştur.
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// ==================== SHARE OPERATIONS ====================

/**
 * Kartviziti sosyal medya veya mesajlaşma uygulamalarıyla paylaş.
 */
export const shareCard = async (
  cardData: Card,
  method: ShareMethod = 'default'
): Promise<ShareResult> => {
  try {
    const vCardData = generateVCard(cardData);
    const deepLink = `cardvault://card/${cardData.id}`;
    
    const shareOptions: ShareOptions = {
      title: `${cardData.company_name} - Kartvizit`,
      message: `${cardData.company_name} kartvizitini görüntüle: ${deepLink}`,
      url: `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`,
      filename: `${(cardData.company_name || 'card').replace(/\s/g, '_')}.vcf`,
    };

    // Belirli bir platform için paylaş
    if (method !== 'default') {
      const social = getSocialPlatform(method);
      if (social) {
        shareOptions.social = social;
      }
    }

    await Share.open(shareOptions as Parameters<typeof Share.open>[0]);

    console.log('Card shared successfully');
    return { success: true, message: SUCCESS_MESSAGES.CARD_SHARED };
  } catch (error) {
    console.error('Share error:', error);
    if ((error as Error).message !== 'User did not share') {
      return { success: false, error: ERROR_MESSAGES.SHARE_FAILED };
    }
    return { success: false, error: 'User cancelled share' };
  }
};

/**
 * Kartviziti belirli bir platformda paylaş.
 */
export const shareToPlatform = async (
  cardData: Card,
  platform: ShareMethod
): Promise<ShareResult> => {
  try {
    const vCardData = generateVCard(cardData);
    const deepLink = `cardvault://card/${cardData.id}`;
    
    const shareOptions: ShareOptions = {
      title: `${cardData.company_name} - Kartvizit`,
      message: `${cardData.company_name} kartvizitini görüntüle: ${deepLink}`,
      url: `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`,
    };

    const social = getSocialPlatform(platform);
    if (social) {
      shareOptions.social = social;
    }

    await Share.open(shareOptions as Parameters<typeof Share.open>[0]);
    
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

// ==================== EXPORT OPERATIONS ====================

/**
 * vCard dosyası olarak dışa aktar.
 */
export const exportVCard = async (cardData: Card): Promise<string> => {
  try {
    const vCardData = generateVCard(cardData);
    const filename = `${(cardData.company_name || 'card').replace(/\s/g, '_')}.vcf`;
    
    // React Native FS ile dosya yazma işlemi burada yapılacak
    console.log('vCard exported:', filename, 'data length:', vCardData.length);
    return filename;
  } catch (error) {
    console.error('vCard export error:', error);
    throw new Error(ERROR_MESSAGES.VCARD_GENERATION_FAILED);
  }
};

/**
 * Kartviziti PDF olarak dışa aktar.
 */
export const exportToPDF = async (cardData: Card): Promise<string> => {
  try {
    // PDF oluşturma işlemi placeholder
    console.log('PDF export simulation completed');
    return `${(cardData.company_name || 'card').replace(/\s/g, '_')}.pdf`;
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDF oluşturulamadı');
  }
};

/**
 * Kartviziti resim olarak dışa aktar.
 */
export const exportToImage = async (cardData: Card): Promise<string> => {
  try {
    // ViewShot kullanarak ekran görüntüsü alma placeholder
    console.log('Image export simulation completed');
    return `${(cardData.company_name || 'card').replace(/\s/g, '_')}.png`;
  } catch (error) {
    console.error('Image export error:', error);
    throw new Error('Resim oluşturulamadı');
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Birden fazla kartviziti toplu olarak paylaş.
 */
export const shareMultipleCards = async (cardsData: Card[]): Promise<ShareResult> => {
  try {
    const vCards = cardsData.map(card => generateVCard(card)).join('\n');
    const filename = `business_cards_${Date.now()}.vcf`;
    
    const shareOptions: ShareOptions = {
      title: `${cardsData.length} Kartvizit`,
      message: `${cardsData.length} adet kartvizit`,
      url: `data:text/vcard;charset=utf-8,${encodeURIComponent(vCards)}`,
      filename,
    };

    await Share.open(shareOptions as Parameters<typeof Share.open>[0]);
    
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

// ==================== STATS ====================

/**
 * Kartvizit paylaşım istatistiklerini al.
 */
export const getShareStats = async (): Promise<ShareStats> => {
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
 */
export const saveShareHistory = async (shareData: Omit<ShareHistoryItem, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const historyItem: ShareHistoryItem = {
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
