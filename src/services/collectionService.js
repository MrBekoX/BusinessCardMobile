/**
 * Collection Service
 * Koleksiyon CRUD operasyonları
 */
import { supabase } from '../lib/supabaseClient';

/**
 * Tüm koleksiyonları getir
 * @param {string} userId - Kullanıcı ID
 * @param {object} options - Filtreleme ve sıralama seçenekleri
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getCollections = async (userId, options = {}) => {
  try {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
      includeCardCount = false,
    } = options;

    if (includeCardCount) {
      // Kart sayısı ile birlikte getir
      const { data, error } = await supabase.rpc('get_collection_with_count', {
        user_id_param: userId,
      });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
      };
    }

    let query = supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId);

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
    console.error('Get collections error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ID'ye göre tek bir koleksiyon getir
 * @param {string} collectionId - Koleksiyon ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getCollectionById = async (collectionId, userId) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Get collection by ID error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Yeni koleksiyon oluştur
 * @param {object} collectionData - Koleksiyon verileri
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const createCollection = async (collectionData, userId) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          ...collectionData,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Koleksiyon başarıyla oluşturuldu',
    };
  } catch (error) {
    console.error('Create collection error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Koleksiyonu güncelle
 * @param {string} collectionId - Koleksiyon ID
 * @param {object} updates - Güncellenecek veriler
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateCollection = async (collectionId, updates, userId) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Koleksiyon başarıyla güncellendi',
    };
  } catch (error) {
    console.error('Update collection error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Koleksiyonu sil
 * @param {string} collectionId - Koleksiyon ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteCollection = async (collectionId, userId) => {
  try {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'Koleksiyon başarıyla silindi',
    };
  } catch (error) {
    console.error('Delete collection error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Koleksiyondaki kartları getir
 * @param {string} collectionId - Koleksiyon ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getCardsInCollection = async (collectionId, userId) => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Koleksiyondaki kartları getir
    const { data, error } = await supabase
      .from('collection_cards')
      .select(`
        id,
        position,
        added_at,
        cards (*)
      `)
      .eq('collection_id', collectionId)
      .order('position', { ascending: true });

    if (error) throw error;

    // Kartları düz array olarak döndür
    const cards = data.map(item => ({
      ...item.cards,
      collection_card_id: item.id,
      position: item.position,
      added_at: item.added_at,
    }));

    return {
      success: true,
      data: cards,
    };
  } catch (error) {
    console.error('Get cards in collection error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Koleksiyona kart ekle
 * @param {string} collectionId - Koleksiyon ID
 * @param {string} cardId - Kart ID
 * @param {string} userId - Kullanıcı ID
 * @param {number} position - Sıralama pozisyonu (opsiyonel)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const addCardToCollection = async (collectionId, cardId, userId, position = null) => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Kartın kullanıcıya ait olduğunu kontrol et
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id')
      .eq('id', cardId)
      .eq('user_id', userId)
      .single();

    if (cardError) throw cardError;

    // Position belirtilmemişse en son pozisyonu bul
    let finalPosition = position;
    if (finalPosition === null) {
      const { data: lastCard } = await supabase
        .from('collection_cards')
        .select('position')
        .eq('collection_id', collectionId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      finalPosition = lastCard ? lastCard.position + 1 : 0;
    }

    // Koleksiyona kart ekle
    const { data, error } = await supabase
      .from('collection_cards')
      .insert([
        {
          collection_id: collectionId,
          card_id: cardId,
          position: finalPosition,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Kart koleksiyona eklendi',
    };
  } catch (error) {
    console.error('Add card to collection error:', error);

    // Unique constraint hatası
    if (error.code === '23505') {
      return {
        success: false,
        error: 'Bu kart zaten koleksiyonda mevcut',
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Koleksiyondan kart çıkar
 * @param {string} collectionId - Koleksiyon ID
 * @param {string} cardId - Kart ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeCardFromCollection = async (collectionId, cardId, userId) => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Koleksiyondan kart çıkar
    const { error } = await supabase
      .from('collection_cards')
      .delete()
      .eq('collection_id', collectionId)
      .eq('card_id', cardId);

    if (error) throw error;

    return {
      success: true,
      message: 'Kart koleksiyondan çıkarıldı',
    };
  } catch (error) {
    console.error('Remove card from collection error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Koleksiyondaki kartları yeniden sırala
 * @param {string} collectionId - Koleksiyon ID
 * @param {array} cardPositions - [{card_id, position}] array
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const reorderCardsInCollection = async (collectionId, cardPositions, userId) => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Her kart için pozisyonu güncelle
    const updatePromises = cardPositions.map(({ card_id, position }) =>
      supabase
        .from('collection_cards')
        .update({ position })
        .eq('collection_id', collectionId)
        .eq('card_id', card_id)
    );

    await Promise.all(updatePromises);

    return {
      success: true,
      message: 'Kartlar yeniden sıralandı',
    };
  } catch (error) {
    console.error('Reorder cards error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Toplu kart ekleme
 * @param {string} collectionId - Koleksiyon ID
 * @param {string[]} cardIds - Eklenecek kart ID'leri
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const bulkAddCardsToCollection = async (collectionId, cardIds, userId) => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Son pozisyonu bul
    const { data: lastCard } = await supabase
      .from('collection_cards')
      .select('position')
      .eq('collection_id', collectionId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    let startPosition = lastCard ? lastCard.position + 1 : 0;

    // Kartları ekle
    const insertData = cardIds.map((cardId, index) => ({
      collection_id: collectionId,
      card_id: cardId,
      position: startPosition + index,
    }));

    const { error } = await supabase
      .from('collection_cards')
      .insert(insertData);

    if (error) throw error;

    return {
      success: true,
      message: `${cardIds.length} kart koleksiyona eklendi`,
    };
  } catch (error) {
    console.error('Bulk add cards error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Toplu kart çıkarma
 * @param {string} collectionId - Koleksiyon ID
 * @param {string[]} cardIds - Çıkarılacak kart ID'leri
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const bulkRemoveCardsFromCollection = async (collectionId, cardIds, userId) => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Kartları çıkar
    const { error } = await supabase
      .from('collection_cards')
      .delete()
      .eq('collection_id', collectionId)
      .in('card_id', cardIds);

    if (error) throw error;

    return {
      success: true,
      message: `${cardIds.length} kart koleksiyondan çıkarıldı`,
    };
  } catch (error) {
    console.error('Bulk remove cards error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Koleksiyon istatistiklerini getir
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getCollectionStats = async (userId) => {
  try {
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId);

    if (collectionsError) throw collectionsError;

    const { data: collectionCards, error: cardsError } = await supabase
      .from('collection_cards')
      .select('collection_id')
      .in('collection_id', collections.map(c => c.id));

    if (cardsError) throw cardsError;

    return {
      success: true,
      data: {
        totalCollections: collections.length,
        totalCardsInCollections: collectionCards.length,
      },
    };
  } catch (error) {
    console.error('Get collection stats error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  getCardsInCollection,
  addCardToCollection,
  removeCardFromCollection,
  reorderCardsInCollection,
  bulkAddCardsToCollection,
  bulkRemoveCardsFromCollection,
  getCollectionStats,
};
