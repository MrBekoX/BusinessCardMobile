/**
 * Profile Service
 * Kullanıcı profili CRUD operasyonları
 */
import { supabase } from '../lib/supabaseClient';

/**
 * Kullanıcı profilini getir
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kullanıcı profilini oluştur
 * @param {string} userId - Kullanıcı ID
 * @param {object} profileData - Profil verileri
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const createProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          ...profileData,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Profil başarıyla oluşturuldu',
    };
  } catch (error) {
    console.error('Create profile error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kullanıcı profilini güncelle
 * @param {string} userId - Kullanıcı ID
 * @param {object} updates - Güncellenecek veriler
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Profil başarıyla güncellendi',
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Avatar yükle
 * @param {string} userId - Kullanıcı ID
 * @param {object} file - Dosya objesi
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const uploadAvatar = async (userId, file) => {
  try {
    const fileExt = file.uri.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Base64'ten blob'a çevir (React Native için)
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Dosyayı yükle
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Public URL al
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Profili güncelle
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      success: true,
      data: {
        ...data,
        avatar_url: urlData.publicUrl,
      },
      message: 'Avatar başarıyla yüklendi',
    };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Avatar sil
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteAvatar = async (userId) => {
  try {
    // Mevcut avatar URL'ini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profile && profile.avatar_url) {
      // Storage'dan sil
      const fileName = profile.avatar_url.split('/').pop();
      const filePath = `avatars/${fileName}`;

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.warn('Storage delete warning:', deleteError);
      }
    }

    // Profildeki avatar_url'i null yap
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Avatar silindi',
    };
  } catch (error) {
    console.error('Delete avatar error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Profil istatistiklerini getir
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getProfileStats = async (userId) => {
  try {
    // Toplam kart sayısı
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, is_favorite')
      .eq('user_id', userId);

    if (cardsError) throw cardsError;

    // Toplam koleksiyon sayısı
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId);

    if (collectionsError) throw collectionsError;

    // Profil bilgileri
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const favoriteCards = cards.filter(card => card.is_favorite).length;

    return {
      success: true,
      data: {
        totalCards: cards.length,
        favoriteCards,
        totalCollections: collections.length,
        memberSince: profile.created_at,
      },
    };
  } catch (error) {
    console.error('Get profile stats error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kullanıcının tüm verilerini sil (hesap silme)
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteUserData = async (userId) => {
  try {
    // Not: Supabase'de CASCADE ayarlandığı için sadece profili silmek yeterli
    // cards, collections, collection_cards otomatik silinecek

    // Avatar varsa sil
    await deleteAvatar(userId);

    // Profili sil (diğer veriler cascade ile silinecek)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'Tüm kullanıcı verileri silindi',
    };
  } catch (error) {
    console.error('Delete user data error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Profil tamamlanma yüzdesini hesapla
 * @param {object} profile - Profil objesi
 * @returns {number} Tamamlanma yüzdesi (0-100)
 */
export const calculateProfileCompleteness = (profile) => {
  if (!profile) return 0;

  const fields = [
    'first_name',
    'last_name',
    'display_name',
    'phone',
    'avatar_url',
    'bio',
  ];

  const filledFields = fields.filter(field => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '';
  }).length;

  return Math.round((filledFields / fields.length) * 100);
};

/**
 * Profil eksik alanlarını getir
 * @param {object} profile - Profil objesi
 * @returns {array} Eksik alan isimleri
 */
export const getMissingProfileFields = (profile) => {
  if (!profile) return [];

  const fieldLabels = {
    first_name: 'Ad',
    last_name: 'Soyad',
    display_name: 'Görünen İsim',
    phone: 'Telefon',
    avatar_url: 'Profil Fotoğrafı',
    bio: 'Biyografi',
  };

  const missingFields = [];

  Object.keys(fieldLabels).forEach(field => {
    const value = profile[field];
    if (value === null || value === undefined || value === '') {
      missingFields.push({
        field,
        label: fieldLabels[field],
      });
    }
  });

  return missingFields;
};

export default {
  getProfile,
  createProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getProfileStats,
  deleteUserData,
  calculateProfileCompleteness,
  getMissingProfileFields,
};
