/**
 * Profile Service
 * Kullanıcı profili CRUD operasyonları
 */
import { supabase } from '@lib/supabaseClient';
import { Profile, ServiceResponse } from '@/types';
import { Logger } from '@lib/logger';

const logger = new Logger('ProfileService');

// ==================== TYPES ====================

interface ProfileData {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  avatar_path?: string;
  avatar_url?: string;
  bio?: string;
}

interface ProfileStats {
  totalCards: number;
  favoriteCards: number;
  totalCollections: number;
  memberSince: string;
}

interface FileObject {
  uri: string;
  type?: string;
  name?: string;
}

interface MissingField {
  field: string;
  label: string;
}

// ==================== GET OPERATIONS ====================

/**
 * Kullanıcı profilini getir
 */
export const getProfile = async (userId: string): Promise<ServiceResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as Profile,
    };
  } catch (error) {
    logger.error('Get profile error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== CREATE/UPDATE ====================

/**
 * Kullanıcı profilini oluştur
 */
export const createProfile = async (
  userId: string,
  profileData: ProfileData
): Promise<ServiceResponse<Profile>> => {
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
      data: data as Profile,
      message: 'Profil başarıyla oluşturuldu',
    };
  } catch (error) {
    logger.error('Create profile error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Kullanıcı profilini güncelle
 */
export const updateProfile = async (
  userId: string,
  updates: ProfileData
): Promise<ServiceResponse<Profile>> => {
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
      data: data as Profile,
      message: 'Profil başarıyla güncellendi',
    };
  } catch (error) {
    logger.error('Update profile error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== AVATAR ====================

// Allowed image types for avatar upload
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

/**
 * Validates file type and size
 */
const validateAvatarFile = async (file: FileObject): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Fetch the file to validate its actual MIME type and size
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Validate file type
    if (!ALLOWED_AVATAR_TYPES.includes(blob.type)) {
      return {
        valid: false,
        error: 'Sadece JPEG, PNG ve WebP dosyaları yüklenebilir',
      };
    }

    // Validate file size
    if (blob.size > MAX_AVATAR_SIZE) {
      return {
        valid: false,
        error: 'Dosya boyutu maksimum 2MB olabilir',
      };
    }

    return { valid: true };
  } catch (error) {
    logger.error('Avatar file validation error', error);
    return {
      valid: false,
      error: 'Dosya doğrulanamadı',
    };
  }
};

/**
 * Avatar yükle - Uses signed URLs for secure access
 */
export const uploadAvatar = async (
  userId: string,
  file: FileObject
): Promise<ServiceResponse<Profile>> => {
  try {
    // Validate file type and size
    const validation = await validateAvatarFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Dosya doğrulaması başarısız',
      };
    }

    // Get file extension and create secure filename
    const fileExt = file.uri.split('.').pop()?.toLowerCase() || 'jpg';
    // Use user-specific folder for additional security
    const objectPath = `${userId}/${Date.now()}.${fileExt}`;

    // Convert to blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(objectPath, blob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Create signed URL instead of public URL (expires in 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(objectPath, SIGNED_URL_EXPIRY);

    if (urlError || !signedUrlData) {
      throw urlError || new Error('Signed URL oluşturulamadı');
    }

    // Update profile with object path (NOT signed URL - signed URL created on demand)
    // F-004 Fix: Object key formatı "<uid>/<filename>" olmalı
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_path: objectPath,
        avatar_url: null  // Clear any old signed URL
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Return signed URL for immediate display (expires in 1 hour)
    return {
      success: true,
      data: {
        ...(data as Profile),
        avatar_url: signedUrlData.signedUrl,  // Temporary signed URL for display
      },
      message: 'Avatar başarıyla yüklendi',
    };
  } catch (error) {
    logger.error('Upload avatar error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Get signed URL for avatar on demand (F-006: Object path saklanır, signed URL anında üretilir)
 */
export const getAvatarSignedUrl = async (
  userId: string
): Promise<ServiceResponse<string>> => {
  try {
    // Get avatar_path from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_path')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.avatar_path) {
      return {
        success: false,
        error: 'Avatar path bulunamadı',
      };
    }

    // Create signed URL on demand
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(profile.avatar_path, SIGNED_URL_EXPIRY);

    if (urlError || !signedUrlData) {
      throw urlError || new Error('Signed URL oluşturulamadı');
    }

    return {
      success: true,
      data: signedUrlData.signedUrl,
      message: 'Avatar URL oluşturuldu',
    };
  } catch (error) {
    logger.error('Get avatar signed URL error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Avatar sil
 */
export const deleteAvatar = async (userId: string): Promise<ServiceResponse<void>> => {
  try {
    // Get current avatar path
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_path')
      .eq('id', userId)
      .single();

    if (profile && profile.avatar_path) {
      // Delete using stored object path
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([profile.avatar_path]);

      if (deleteError) {
        logger.warn('Storage delete warning', deleteError);
      }
    }

    // Profildeki avatar_path ve avatar_url'i null yap
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_path: null, avatar_url: null })
      .eq('id', userId);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Avatar silindi',
    };
  } catch (error) {
    logger.error('Delete avatar error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== STATS ====================

/**
 * Profil istatistiklerini getir
 */
export const getProfileStats = async (userId: string): Promise<ServiceResponse<ProfileStats>> => {
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

    const favoriteCards = (cards || []).filter((card: { is_favorite: boolean }) => card.is_favorite).length;

    return {
      success: true,
      data: {
        totalCards: (cards || []).length,
        favoriteCards,
        totalCollections: (collections || []).length,
        memberSince: (profile as { created_at: string }).created_at,
      },
    };
  } catch (error) {
    logger.error('Get profile stats error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== DELETE USER ====================

/**
 * Kullanıcının tüm verilerini sil (hesap silme)
 */
export const deleteUserData = async (userId: string): Promise<ServiceResponse<void>> => {
  try {
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
    logger.error('Delete user data error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== HELPERS ====================

/**
 * Profil tamamlanma yüzdesini hesapla
 */
export const calculateProfileCompleteness = (profile: Profile | null): number => {
  if (!profile) return 0;

  const fields: (keyof Profile)[] = [
    'first_name',
    'last_name',
    'display_name',
    'phone',
    'avatar_path',
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
 */
export const getMissingProfileFields = (profile: Profile | null): MissingField[] => {
  if (!profile) return [];

  const fieldLabels: Record<string, string> = {
    first_name: 'Ad',
    last_name: 'Soyad',
    display_name: 'Görünen İsim',
    phone: 'Telefon',
    avatar_path: 'Profil Fotoğrafı',
    bio: 'Biyografi',
  };

  const missingFields: MissingField[] = [];

  Object.keys(fieldLabels).forEach(field => {
    const value = profile[field as keyof Profile];
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
  getAvatarSignedUrl,  // F-006: Object path'den signed URL üret
  getProfileStats,
  deleteUserData,
  calculateProfileCompleteness,
  getMissingProfileFields,
};
