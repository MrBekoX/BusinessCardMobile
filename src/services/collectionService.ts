/**
 * Collection Service
 * Koleksiyon CRUD operasyonları
 */
import { supabase } from '@lib/supabaseClient';
import {
  Collection,
  Card,
  CreateCollectionInput,
  UpdateCollectionInput,
  GetCollectionsOptions,
  ServiceResponse,
  CollectionStats,
} from '@/types';

// ==================== TYPES ====================

interface GetCollectionsOptionsExtended extends GetCollectionsOptions {
  includeCardCount?: boolean;
}



interface CardPosition {
  cardId: string;
  position: number;
}

// ==================== GET OPERATIONS ====================

/**
 * Tüm koleksiyonları getir
 */
export const getCollections = async (
  userId: string,
  options: GetCollectionsOptionsExtended = {}
): Promise<ServiceResponse<Collection[]>> => {
  try {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
      includeCardCount = false,
    } = options;

    if (includeCardCount) {
      const { data, error } = await supabase.rpc('get_collection_with_count', {
        user_id_param: userId,
      });

      if (error) throw error;

      return {
        success: true,
        data: (data || []) as Collection[],
      };
    }

    let query = supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId);

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: (data || []) as Collection[],
    };
  } catch (error) {
    console.error('Get collections error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * ID'ye göre tek bir koleksiyon getir
 */
export const getCollectionById = async (
  collectionId: string,
  userId: string
): Promise<ServiceResponse<Collection>> => {
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
      data: data as Collection,
    };
  } catch (error) {
    console.error('Get collection by ID error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== CREATE/UPDATE/DELETE ====================

/**
 * Yeni koleksiyon oluştur
 */
export const createCollection = async (
  collectionData: CreateCollectionInput,
  userId: string
): Promise<ServiceResponse<Collection>> => {
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
      data: data as Collection,
      message: 'Koleksiyon başarıyla oluşturuldu',
    };
  } catch (error) {
    console.error('Create collection error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Koleksiyonu güncelle
 */
export const updateCollection = async (
  collectionId: string,
  updates: UpdateCollectionInput,
  userId: string
): Promise<ServiceResponse<Collection>> => {
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
      data: data as Collection,
      message: 'Koleksiyon başarıyla güncellendi',
    };
  } catch (error) {
    console.error('Update collection error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Koleksiyonu sil
 */
export const deleteCollection = async (
  collectionId: string,
  userId: string
): Promise<ServiceResponse<void>> => {
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
      error: (error as Error).message,
    };
  }
};

// ==================== CARD OPERATIONS ====================

/**
 * Koleksiyondaki kartları getir
 */
export const getCardsInCollection = async (
  collectionId: string,
  userId: string
): Promise<ServiceResponse<Card[]>> => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { error: collectionError } = await supabase
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
    const cards = (data || []).map((item: Record<string, unknown>) => ({
      ...(item.cards as Record<string, unknown>),
      collection_card_id: item.id,
      position: item.position,
      added_at: item.added_at,
    })) as unknown as Card[];

    return {
      success: true,
      data: cards,
    };
  } catch (error) {
    console.error('Get cards in collection error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Koleksiyona kart ekle
 */
export const addCardToCollection = async (
  collectionId: string,
  cardId: string,
  userId: string,
  position: number | null = null
): Promise<ServiceResponse<void>> => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Kartın kullanıcıya ait olduğunu kontrol et
    const { error: cardError } = await supabase
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

      finalPosition = lastCard ? (lastCard.position as number) + 1 : 0;
    }

    // Koleksiyona kart ekle
    const { error } = await supabase
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
      message: 'Kart koleksiyona eklendi',
    };
  } catch (error) {
    console.error('Add card to collection error:', error);

    // Unique constraint hatası
    if ((error as { code?: string }).code === '23505') {
      return {
        success: false,
        error: 'Bu kart zaten koleksiyonda mevcut',
      };
    }

    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Koleksiyondan kart çıkar
 */
export const removeCardFromCollection = async (
  collectionId: string,
  cardId: string,
  userId: string
): Promise<ServiceResponse<void>> => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { error: collectionError } = await supabase
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
      error: (error as Error).message,
    };
  }
};

/**
 * Koleksiyondaki kartları yeniden sırala
 */
export const reorderCardsInCollection = async (
  collectionId: string,
  cardPositions: CardPosition[],
  userId: string
): Promise<ServiceResponse<void>> => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .single();

    if (collectionError) throw collectionError;

    // Her kart için pozisyonu güncelle
    const updatePromises = cardPositions.map(({ cardId, position }) =>
      supabase
        .from('collection_cards')
        .update({ position })
        .eq('collection_id', collectionId)
        .eq('card_id', cardId)
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
      error: (error as Error).message,
    };
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Toplu kart ekleme
 */
export const bulkAddCardsToCollection = async (
  collectionId: string,
  cardIds: string[],
  userId: string
): Promise<ServiceResponse<void>> => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { error: collectionError } = await supabase
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

    let startPosition = lastCard ? (lastCard.position as number) + 1 : 0;

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
      error: (error as Error).message,
    };
  }
};

/**
 * Toplu kart çıkarma
 */
export const bulkRemoveCardsFromCollection = async (
  collectionId: string,
  cardIds: string[],
  userId: string
): Promise<ServiceResponse<void>> => {
  try {
    // Önce koleksiyonun kullanıcıya ait olduğunu kontrol et
    const { error: collectionError } = await supabase
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
      error: (error as Error).message,
    };
  }
};

// ==================== STATS ====================

/**
 * Koleksiyon istatistiklerini getir
 */
export const getCollectionStats = async (
  userId: string
): Promise<ServiceResponse<CollectionStats>> => {
  try {
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId);

    if (collectionsError) throw collectionsError;

    const collectionIds = (collections || []).map((c: { id: string }) => c.id);

    const { data: collectionCards, error: cardsError } = await supabase
      .from('collection_cards')
      .select('collection_id')
      .in('collection_id', collectionIds);

    if (cardsError) throw cardsError;

    const totalCollections = (collections || []).length;
    const totalCardsInCollections = (collectionCards || []).length;

    return {
      success: true,
      data: {
        totalCollections,
        totalCardsInCollections,
        averageCardsPerCollection: totalCollections > 0
          ? Math.round(totalCardsInCollections / totalCollections)
          : 0,
      },
    };
  } catch (error) {
    console.error('Get collection stats error:', error);
    return {
      success: false,
      error: (error as Error).message,
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
