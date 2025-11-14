/**
 * Card Service
 * Kartvizit CRUD operasyonları
 */
import { supabase } from '../lib/supabaseClient';

/**
 * Tüm kartları getir
 * @param {string} userId - Kullanıcı ID
 * @param {object} options - Filtreleme ve sıralama seçenekleri
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getCards = async (userId, options = {}) => {
  try {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
      isFavorite = null,
      tags = null,
    } = options;

    let query = supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId);

    // Favori filtresi
    if (isFavorite !== null) {
      query = query.eq('is_favorite', isFavorite);
    }

    // Tag filtresi
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Sıralama
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Limit ve offset
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Get cards error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ID'ye göre tek bir kart getir
 * @param {string} cardId - Kart ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getCardById = async (cardId, userId) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Get card by ID error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kartlarda arama yap
 * @param {string} userId - Kullanıcı ID
 * @param {string} searchQuery - Arama sorgusu
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const searchCards = async (userId, searchQuery) => {
  try {
    if (!searchQuery || searchQuery.trim() === '') {
      return getCards(userId);
    }

    const { data, error } = await supabase.rpc('search_cards', {
      user_id_param: userId,
      search_query: searchQuery,
    });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Search cards error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Yeni kart oluştur
 * @param {object} cardData - Kart verileri
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const createCard = async (cardData, userId) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          ...cardData,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Kartvizit başarıyla oluşturuldu',
    };
  } catch (error) {
    console.error('Create card error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kartı güncelle
 * @param {string} cardId - Kart ID
 * @param {object} updates - Güncellenecek veriler
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateCard = async (cardId, updates, userId) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Kartvizit başarıyla güncellendi',
    };
  } catch (error) {
    console.error('Update card error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kartı sil
 * @param {string} cardId - Kart ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteCard = async (cardId, userId) => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'Kartvizit başarıyla silindi',
    };
  } catch (error) {
    console.error('Delete card error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kartın favori durumunu değiştir
 * @param {string} cardId - Kart ID
 * @param {boolean} isFavorite - Favori durumu
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const toggleCardFavorite = async (cardId, isFavorite, userId) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .update({ is_favorite: isFavorite })
      .eq('id', cardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: isFavorite ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı',
    };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Karta tag ekle
 * @param {string} cardId - Kart ID
 * @param {string} tag - Eklenecek tag
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const addTagToCard = async (cardId, tag, userId) => {
  try {
    // Önce mevcut kartı al
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('tags')
      .eq('id', cardId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Yeni tag'i ekle
    const currentTags = card.tags || [];
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
    }

    // Güncelle
    const { data, error } = await supabase
      .from('cards')
      .update({ tags: currentTags })
      .eq('id', cardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Tag eklendi',
    };
  } catch (error) {
    console.error('Add tag error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Karttan tag çıkar
 * @param {string} cardId - Kart ID
 * @param {string} tag - Çıkarılacak tag
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const removeTagFromCard = async (cardId, tag, userId) => {
  try {
    // Önce mevcut kartı al
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('tags')
      .eq('id', cardId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Tag'i çıkar
    const currentTags = card.tags || [];
    const updatedTags = currentTags.filter(t => t !== tag);

    // Güncelle
    const { data, error } = await supabase
      .from('cards')
      .update({ tags: updatedTags })
      .eq('id', cardId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Tag çıkarıldı',
    };
  } catch (error) {
    console.error('Remove tag error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Toplu kart silme
 * @param {string[]} cardIds - Silinecek kart ID'leri
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const bulkDeleteCards = async (cardIds, userId) => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .in('id', cardIds)
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: `${cardIds.length} kartvizit silindi`,
    };
  } catch (error) {
    console.error('Bulk delete cards error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Favori kartları getir
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getFavoriteCards = async (userId) => {
  return getCards(userId, { isFavorite: true });
};

/**
 * Kartları tag'e göre getir
 * @param {string} userId - Kullanıcı ID
 * @param {string[]} tags - Tag listesi
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getCardsByTags = async (userId, tags) => {
  return getCards(userId, { tags });
};

/**
 * Kart istatistiklerini getir
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getCardStats = async (userId) => {
  try {
    const { data: allCards, error: allError } = await supabase
      .from('cards')
      .select('id, is_favorite, tags')
      .eq('user_id', userId);

    if (allError) throw allError;

    const { data: favoriteCards, error: favError } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', userId)
      .eq('is_favorite', true);

    if (favError) throw favError;

    // Tüm tagları topla
    const allTags = new Set();
    allCards.forEach(card => {
      if (card.tags) {
        card.tags.forEach(tag => allTags.add(tag));
      }
    });

    return {
      success: true,
      data: {
        totalCards: allCards.length,
        favoriteCards: favoriteCards.length,
        uniqueTags: allTags.size,
        tags: Array.from(allTags),
      },
    };
  } catch (error) {
    console.error('Get card stats error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getCards,
  getCardById,
  searchCards,
  createCard,
  updateCard,
  deleteCard,
  toggleCardFavorite,
  addTagToCard,
  removeTagFromCard,
  bulkDeleteCards,
  getFavoriteCards,
  getCardsByTags,
  getCardStats,
};
