/**
 * Card Service
 * Kartvizit CRUD operasyonları
 */
import { supabase } from '@lib/supabaseClient';
import {
  Card,
  CreateCardInput,
  UpdateCardInput,
  GetCardsOptions,
  ServiceResponse,
  CardStats,
} from '@/types';
import { Logger } from '@lib/logger';

const logger = new Logger('CardService');

// ==================== GET OPERATIONS ====================

/**
 * Tüm kartları getir
 */
export const getCards = async (
  userId: string,
  options: GetCardsOptions = {}
): Promise<ServiceResponse<Card[]>> => {
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
      data: (data || []) as Card[],
    };
  } catch (error) {
    logger.error('Get cards error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * ID'ye göre tek bir kart getir
 */
export const getCardById = async (
  cardId: string,
  userId: string
): Promise<ServiceResponse<Card>> => {
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
      data: data as Card,
    };
  } catch (error) {
    logger.error('Get card by ID error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Kartlarda arama yap
 */
export const searchCards = async (
  userId: string,
  searchQuery: string
): Promise<ServiceResponse<Card[]>> => {
  try {
    if (!searchQuery || searchQuery.trim() === '') {
      return getCards(userId);
    }

    // RPC fonksiyonu artık auth.uid() kullanıyor, user_id_param gerekmez (SECURITY INVOKER)
    const { data, error } = await supabase.rpc('search_cards', {
      search_query: searchQuery,
    });

    if (error) throw error;

    return {
      success: true,
      data: (data || []) as Card[],
    };
  } catch (error) {
    logger.error('Search cards error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== CREATE/UPDATE/DELETE ====================

/**
 * Yeni kart oluştur
 */
export const createCard = async (
  cardData: CreateCardInput,
  userId: string
): Promise<ServiceResponse<Card>> => {
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
      data: data as Card,
      message: 'Kartvizit başarıyla oluşturuldu',
    };
  } catch (error) {
    logger.error('Create card error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Kartı güncelle
 */
export const updateCard = async (
  cardId: string,
  updates: UpdateCardInput,
  userId: string
): Promise<ServiceResponse<Card>> => {
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
      data: data as Card,
      message: 'Kartvizit başarıyla güncellendi',
    };
  } catch (error) {
    logger.error('Update card error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Kartı sil
 */
export const deleteCard = async (
  cardId: string,
  userId: string
): Promise<ServiceResponse<void>> => {
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
    logger.error('Delete card error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== FAVORITE & TAGS ====================

/**
 * Kartın favori durumunu değiştir
 */
export const toggleCardFavorite = async (
  cardId: string,
  isFavorite: boolean,
  userId: string
): Promise<ServiceResponse<Card>> => {
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
      data: data as Card,
      message: isFavorite ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı',
    };
  } catch (error) {
    logger.error('Toggle favorite error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Karta tag ekle
 */
export const addTagToCard = async (
  cardId: string,
  tag: string,
  userId: string
): Promise<ServiceResponse<Card>> => {
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
    const currentTags: string[] = (card?.tags as string[]) || [];
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
      data: data as Card,
      message: 'Tag eklendi',
    };
  } catch (error) {
    logger.error('Add tag error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Karttan tag çıkar
 */
export const removeTagFromCard = async (
  cardId: string,
  tag: string,
  userId: string
): Promise<ServiceResponse<Card>> => {
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
    const currentTags: string[] = (card?.tags as string[]) || [];
    const updatedTags = currentTags.filter((t: string) => t !== tag);

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
      data: data as Card,
      message: 'Tag çıkarıldı',
    };
  } catch (error) {
    logger.error('Remove tag error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Toplu kart silme
 */
export const bulkDeleteCards = async (
  cardIds: string[],
  userId: string
): Promise<ServiceResponse<void>> => {
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
    logger.error('Bulk delete cards error', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// ==================== QUERY HELPERS ====================

/**
 * Favori kartları getir
 */
export const getFavoriteCards = async (
  userId: string
): Promise<ServiceResponse<Card[]>> => {
  return getCards(userId, { isFavorite: true });
};

/**
 * Kartları tag'e göre getir
 */
export const getCardsByTags = async (
  userId: string,
  tags: string[]
): Promise<ServiceResponse<Card[]>> => {
  return getCards(userId, { tags });
};

/**
 * Kart istatistiklerini getir
 */
export const getCardStats = async (
  userId: string
): Promise<ServiceResponse<CardStats>> => {
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
    const allTags = new Set<string>();
    (allCards || []).forEach((card: { tags?: string[] }) => {
      if (card.tags) {
        card.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    return {
      success: true,
      data: {
        totalCards: (allCards || []).length,
        favoriteCards: (favoriteCards || []).length,
        uniqueTags: allTags.size,
        tags: Array.from(allTags),
      },
    };
  } catch (error) {
    logger.error('Get card stats error', error);
    return {
      success: false,
      error: (error as Error).message,
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
