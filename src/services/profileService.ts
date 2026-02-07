/**
 * Profile Service
 * Kullanıcı profili CRUD operasyonları
 */
import { supabase } from '@lib/supabaseClient';
import { Profile, ServiceResponse } from '@/types';

// ==================== TYPES ====================

interface ProfileData {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
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
    console.error('Get profile error:', error);
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
    console.error('Create profile error:', error);
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
    console.error('Update profile error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== AVATAR ====================

/**
 * Avatar yükle
 */
export const uploadAvatar = async (
  userId: string,
  file: FileObject
): Promise<ServiceResponse<Profile>> => {
  try {
    const fileExt = file.uri.split('.').pop() || 'jpg';
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
        ...(data as Profile),
        avatar_url: urlData.publicUrl,
      },
      message: 'Avatar başarıyla yüklendi',
    };
  } catch (error) {
    console.error('Upload avatar error:', error);
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
    // Mevcut avatar URL'ini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profile && profile.avatar_url) {
      // Storage'dan sil
      const fileName = (profile.avatar_url as string).split('/').pop();
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
    console.error('Get profile stats error:', error);
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
    console.error('Delete user data error:', error);
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
 */
export const getMissingProfileFields = (profile: Profile | null): MissingField[] => {
  if (!profile) return [];

  const fieldLabels: Record<string, string> = {
    first_name: 'Ad',
    last_name: 'Soyad',
    display_name: 'Görünen İsim',
    phone: 'Telefon',
    avatar_url: 'Profil Fotoğrafı',
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
  getProfileStats,
  deleteUserData,
  calculateProfileCompleteness,
  getMissingProfileFields,
};
