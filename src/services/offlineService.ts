/**
 * Offline mod ve cache yönetim servisi.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import Settings from '@config/settings';
import { Logger } from '@lib/logger';

const logger = new Logger('OfflineService');

// ==================== TYPES ====================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  maxAge: number;
  version: string;
}

interface SyncOperation {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
}

interface CacheStats {
  totalItems: number;
  validItems: number;
  expiredItems: number;
  totalSize: string;
}

type NetworkCallback = (isOnline: boolean, state: NetInfoState) => void;
type UpdateFunction<T> = (currentData: T | null) => T | undefined;

// ==================== CONSTANTS ====================

const CACHE_PREFIX = '@cardvault_cache_';
const SYNC_QUEUE_KEY = '@cardvault_sync_queue';
const LAST_SYNC_KEY = '@cardvault_last_sync';

// ==================== NETWORK ====================

/**
 * Network durumunu kontrol eder.
 */
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return !!(state.isConnected && state.isInternetReachable);
  } catch (error) {
    logger.error('Network status check error', error);
    return false;
  }
};

/**
 * Network durumu değişikliklerini dinler.
 */
export const subscribeToNetworkStatus = (callback: NetworkCallback): NetInfoSubscription => {
  return NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = !!(state.isConnected && state.isInternetReachable);
    callback(isOnline, state);
  });
};

// ==================== CACHE OPERATIONS ====================

/**
 * Veriyi cache'e kaydet.
 */
export const cacheData = async <T>(
  key: string,
  data: T,
  maxAge: number = Settings.cache.maxAge
): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      maxAge,
      version: '1.0',
    };
    
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(cacheItem)
    );
    
    logger.debug(`Data cached: ${key}`);
  } catch (error) {
    logger.error('Cache write error', error);
  }
};

/**
 * Cache'den veri oku.
 */
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!cached) return null;
    
    const cacheItem: CacheItem<T> = JSON.parse(cached);
    const age = Date.now() - cacheItem.timestamp;
    
    // Cache süresi dolmuşsa null dön
    if (age > cacheItem.maxAge) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      logger.debug(`Cache expired and removed: ${key}`);
      return null;
    }
    
    logger.debug(`Cache hit: ${key}`);
    return cacheItem.data;
  } catch (error) {
    logger.error('Cache read error', error);
    return null;
  }
};

/**
 * Cache'deki veriyi güncelle.
 */
export const updateCachedData = async <T>(
  key: string,
  updateFn: UpdateFunction<T>
): Promise<boolean> => {
  try {
    const currentData = await getCachedData<T>(key);
    const updatedData = updateFn(currentData);
    
    if (updatedData !== undefined) {
      await cacheData(key, updatedData);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Cache update error', error);
    return false;
  }
};

/**
 * Cache'deki veriyi sil.
 */
export const removeCachedData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    logger.debug(`Cache removed: ${key}`);
  } catch (error) {
    logger.error('Cache remove error', error);
  }
};

/**
 * Tüm cache'i temizle.
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    logger.info('All cache cleared');
  } catch (error) {
    logger.error('Clear all cache error', error);
  }
};

/**
 * Cache istatistiklerini al.
 */
export const getCacheStats = async (): Promise<CacheStats> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    let validItems = 0;
    let expiredItems = 0;
    
    for (const key of cacheKeys) {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        totalSize += item.length;
        const cacheItem: CacheItem<unknown> = JSON.parse(item);
        const age = Date.now() - cacheItem.timestamp;
        
        if (age > cacheItem.maxAge) {
          expiredItems++;
        } else {
          validItems++;
        }
      }
    }
    
    return {
      totalItems: cacheKeys.length,
      validItems,
      expiredItems,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    };
  } catch (error) {
    logger.error('Cache stats error', error);
    return { totalItems: 0, validItems: 0, expiredItems: 0, totalSize: '0 KB' };
  }
};

// ==================== SYNC QUEUE ====================

/**
 * Benzersiz ID oluştur.
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Senkronizasyon kuyruğuna işlem ekle.
 */
export const addToSyncQueue = async (
  operation: Omit<SyncOperation, 'id' | 'timestamp' | 'attempts' | 'maxAttempts'>
): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    queue.push({
      ...operation,
      id: generateId(),
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3,
    });
    
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    logger.debug('Operation added to sync queue', { type: operation.type });
  } catch (error) {
    logger.error('Sync queue add error', error);
  }
};

/**
 * Senkronizasyon kuyruğunu getir.
 */
export const getSyncQueue = async (): Promise<SyncOperation[]> => {
  try {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    logger.error('Sync queue read error', error);
    return [];
  }
};

/**
 * Senkronizasyon kuyruğunu temizle.
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    logger.info('Sync queue cleared');
  } catch (error) {
    logger.error('Sync queue clear error', error);
  }
};

/**
 * Senkronizasyon kuyruğundan işlem sil.
 */
export const removeFromSyncQueue = async (operationId: string): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    const filteredQueue = queue.filter(op => op.id !== operationId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));
    logger.debug('Operation removed from sync queue', { operationId });
  } catch (error) {
    logger.error('Sync queue remove error', error);
  }
};

/**
 * Senkronizasyon kuyruğundaki işlemi güncelle.
 */
export const updateSyncQueueItem = async (
  operationId: string,
  updates: Partial<SyncOperation>
): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    const itemIndex = queue.findIndex(op => op.id === operationId);
    
    if (itemIndex !== -1) {
      queue[itemIndex] = { ...queue[itemIndex], ...updates };
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      logger.debug('Sync queue item updated', { operationId });
    }
  } catch (error) {
    logger.error('Sync queue update error', error);
  }
};

// ==================== SYNC OPERATIONS ====================

/**
 * Senkronizasyon işlemini gerçekleştir.
 */
const performSyncOperation = async (operation: SyncOperation): Promise<void> => {
  logger.debug('Performing sync operation', { type: operation.type });
  
  // Simülasyon için kısa bir gecikme
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Offline işlemleri senkronize et.
 */
export const syncOfflineOperations = async (): Promise<void> => {
  const isOnline = await checkNetworkStatus();
  
  if (!isOnline) {
    logger.debug('Offline mode, sync not available');
    return;
  }
  
  const queue = await getSyncQueue();
  
  if (queue.length === 0) {
    logger.debug('No operations to sync');
    return;
  }
  
  logger.info(`${queue.length} operations to sync`);
  
  // Her bir işlemi senkronize et
  for (const operation of queue) {
    try {
      await performSyncOperation(operation);
      await removeFromSyncQueue(operation.id);
      logger.debug('Operation synced', { type: operation.type });
    } catch (error) {
      logger.error('Sync error', error);
      
      // Hata durumunda tekrar deneme
      const updatedAttempts = (operation.attempts || 0) + 1;
      
      if (updatedAttempts >= operation.maxAttempts) {
        // Maksimum deneme sayısına ulaşıldı, işlemi başarısız olarak işaretle
        await removeFromSyncQueue(operation.id);
        logger.warn('Operation failed, removed from queue', { type: operation.type });
      } else {
        // Tekrar deneme sayısını artır
        await updateSyncQueueItem(operation.id, { 
          attempts: updatedAttempts,
          lastError: (error as Error).message,
        });
      }
    }
  }
  
  // Son senkronizasyon zamanını güncelle
  await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
};

/**
 * Son senkronizasyon zamanını al.
 */
export const getLastSyncTime = async (): Promise<number | null> => {
  try {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return lastSync ? parseInt(lastSync, 10) : null;
  } catch (error) {
    logger.error('Get last sync time error', error);
    return null;
  }
};

/**
 * Offline modda mı kontrol et.
 */
export const isOfflineMode = async (): Promise<boolean> => {
  const isOnline = await checkNetworkStatus();
  return !isOnline;
};

// ==================== OFFLINE UTILS ====================

interface CardData {
  id?: string;
  [key: string]: unknown;
}

interface CollectionData {
  id?: string;
  [key: string]: unknown;
}

export const offlineUtils = {
  /**
   * Kartvizit oluşturma işlemini kuyruğa ekle
   */
  queueCardCreation: async (cardData: CardData): Promise<void> => {
    return addToSyncQueue({
      type: 'CREATE_CARD',
      data: cardData,
    });
  },
  
  /**
   * Kartvizit güncelleme işlemini kuyruğa ekle
   */
  queueCardUpdate: async (cardData: CardData): Promise<void> => {
    return addToSyncQueue({
      type: 'UPDATE_CARD',
      data: cardData,
    });
  },
  
  /**
   * Kartvizit silme işlemini kuyruğa ekle
   */
  queueCardDeletion: async (cardId: string): Promise<void> => {
    return addToSyncQueue({
      type: 'DELETE_CARD',
      data: { id: cardId },
    });
  },
  
  /**
   * Koleksiyon işlemlerini kuyruğa ekle
   */
  queueCollectionOperation: async (
    operation: string,
    collectionData: CollectionData
  ): Promise<void> => {
    return addToSyncQueue({
      type: `COLLECTION_${operation.toUpperCase()}`,
      data: collectionData,
    });
  },
};

export default {
  checkNetworkStatus,
  subscribeToNetworkStatus,
  cacheData,
  getCachedData,
  updateCachedData,
  removeCachedData,
  clearAllCache,
  getCacheStats,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueItem,
  syncOfflineOperations,
  getLastSyncTime,
  isOfflineMode,
  offlineUtils,
};
