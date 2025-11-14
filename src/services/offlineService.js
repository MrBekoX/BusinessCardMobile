/**
 * Offline mod ve cache yönetim servisi.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Settings from '../config/settings';

/**
 * Network durumunu kontrol eder.
 * @returns {Promise<boolean>} Online ise true döner.
 */
export const checkNetworkStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    console.error('Network status check error:', error);
    return false;
  }
};

/**
 * Network durumu değişikliklerini dinler.
 * @param {function} callback - Durum değiştiğinde çağrılacak fonksiyon.
 * @returns {function} Unsubscribe fonksiyonu.
 */
export const subscribeToNetworkStatus = (callback) => {
  return NetInfo.addEventListener(state => {
    const isOnline = state.isConnected && state.isInternetReachable;
    callback(isOnline, state);
  });
};

// Cache prefix'leri
const CACHE_PREFIX = '@cardvault_cache_';
const SYNC_QUEUE_KEY = '@cardvault_sync_queue';
const OFFLINE_QUEUE_KEY = '@cardvault_offline_queue';
const LAST_SYNC_KEY = '@cardvault_last_sync';

/**
 * Veriyi cache'e kaydet.
 * @param {string} key - Cache key.
 * @param {any} data - Kaydedilecek veri.
 * @param {number} maxAge - Cache süresi (ms), varsayılan 24 saat.
 * @returns {Promise<void>}
 */
export const cacheData = async (key, data, maxAge = Settings.cache.maxAge) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      maxAge,
      version: '1.0',
    };
    
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(cacheItem)
    );
    
    console.log(`Data cached: ${key}`);
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

/**
 * Cache'den veri oku.
 * @param {string} key - Cache key.
 * @returns {Promise<any|null>} Cache'deki veri veya null.
 */
export const getCachedData = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!cached) return null;
    
    const cacheItem = JSON.parse(cached);
    const age = Date.now() - cacheItem.timestamp;
    
    // Cache süresi dolmuşsa null dön
    if (age > cacheItem.maxAge) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      console.log(`Cache expired and removed: ${key}`);
      return null;
    }
    
    console.log(`Cache hit: ${key}`);
    return cacheItem.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

/**
Cache'deki veriyi güncelle.
 * @param {string} key - Cache key.
 * @param {any} updateFn - Güncelleme fonksiyonu.
 * @returns {Promise<boolean>} Başarılı mı.
 */
export const updateCachedData = async (key, updateFn) => {
  try {
    const currentData = await getCachedData(key);
    const updatedData = updateFn(currentData);
    
    if (updatedData !== undefined) {
      await cacheData(key, updatedData);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Cache update error:', error);
    return false;
  }
};

/**
 * Cache'deki veriyi sil.
 * @param {string} key - Cache key.
 * @returns {Promise<void>}
 */
export const removeCachedData = async (key) => {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    console.log(`Cache removed: ${key}`);
  } catch (error) {
    console.error('Cache remove error:', error);
  }
};

/**
 * Tüm cache'i temizle.
 * @returns {Promise<void>}
 */
export const clearAllCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('All cache cleared');
  } catch (error) {
    console.error('Clear all cache error:', error);
  }
};

/**
 * Cache istatistiklerini al.
 * @returns {Promise<object>} Cache istatistikleri.
 */
export const getCacheStats = async () => {
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
        const cacheItem = JSON.parse(item);
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
    console.error('Cache stats error:', error);
    return { totalItems: 0, validItems: 0, expiredItems: 0, totalSize: '0 KB' };
  }
};

/**
 * Senkronizasyon kuyruğuna işlem ekle.
 * @param {object} operation - Senkronize edilecek işlem.
 * @returns {Promise<void>}
 */
export const addToSyncQueue = async (operation) => {
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
    console.log('Operation added to sync queue:', operation.type);
  } catch (error) {
    console.error('Sync queue add error:', error);
  }
};

/**
 * Senkronizasyon kuyruğunu getir.
 * @returns {Promise<Array>} Kuyruk.
 */
export const getSyncQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Sync queue read error:', error);
    return [];
  }
};

/**
 * Senkronizasyon kuyruğunu temizle.
 * @returns {Promise<void>}
 */
export const clearSyncQueue = async () => {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    console.log('Sync queue cleared');
  } catch (error) {
    console.error('Sync queue clear error:', error);
  }
};

/**
 * Senkronizasyon kuyruğundan işlem sil.
 * @param {string} operationId - İşlem ID.
 * @returns {Promise<void>}
 */
export const removeFromSyncQueue = async (operationId) => {
  try {
    const queue = await getSyncQueue();
    const filteredQueue = queue.filter(op => op.id !== operationId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));
    console.log('Operation removed from sync queue:', operationId);
  } catch (error) {
    console.error('Sync queue remove error:', error);
  }
};

/**
 * Senkronizasyon kuyruğundaki işlemi güncelle.
 * @param {string} operationId - İşlem ID.
 * @param {object} updates - Güncellenecek alanlar.
 * @returns {Promise<void>}
 */
export const updateSyncQueueItem = async (operationId, updates) => {
  try {
    const queue = await getSyncQueue();
    const itemIndex = queue.findIndex(op => op.id === operationId);
    
    if (itemIndex !== -1) {
      queue[itemIndex] = { ...queue[itemIndex], ...updates };
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      console.log('Sync queue item updated:', operationId);
    }
  } catch (error) {
    console.error('Sync queue update error:', error);
  }
};

/**
 * Offline işlemleri senkronize et.
 * @returns {Promise<void>}
 */
export const syncOfflineOperations = async () => {
  const isOnline = await checkNetworkStatus();
  
  if (!isOnline) {
    console.log('Offline durumda, senkronizasyon yapılamıyor');
    return;
  }
  
  const queue = await getSyncQueue();
  
  if (queue.length === 0) {
    console.log('Senkronize edilecek işlem yok');
    return;
  }
  
  console.log(`${queue.length} işlem senkronize ediliyor...`);
  
  // Her bir işlemi senkronize et
  for (const operation of queue) {
    try {
      await performSyncOperation(operation);
      await removeFromSyncQueue(operation.id);
      console.log('İşlem senkronize edildi:', operation.type);
    } catch (error) {
      console.error('Senkronizasyon hatası:', error);
      
      // Hata durumunda tekrar deneme
      const updatedAttempts = (operation.attempts || 0) + 1;
      
      if (updatedAttempts >= operation.maxAttempts) {
        // Maksimum deneme sayısına ulaşıldı, işlemi başarısız olarak işaretle
        await removeFromSyncQueue(operation.id);
        console.log('İşlem başarısız, kuyruktan kaldırıldı:', operation.type);
      } else {
        // Tekrar deneme sayısını artır
        await updateSyncQueueItem(operation.id, { 
          attempts: updatedAttempts,
          lastError: error.message,
        });
      }
    }
  }
  
  // Son senkronizasyon zamanını güncelle
  await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
};

/**
 * Senkronizasyon işlemini gerçekleştir.
 * @param {object} operation - Senkronize edilecek işlem.
 * @returns {Promise<void>}
 */
const performSyncOperation = async (operation) => {
  // Burada API çağrıları yapılacak
  // Örnek:
  // switch (operation.type) {
  //   case 'CREATE_CARD':
  //     return await createCardAPI(operation.data);
  //   case 'UPDATE_CARD':
  //     return await updateCardAPI(operation.data);
  //   case 'DELETE_CARD':
  //     return await deleteCardAPI(operation.data);
  //   default:
  //     throw new Error(`Unknown operation type: ${operation.type}`);
  // }
  
  console.log('Performing sync operation:', operation.type);
  
  // Simülasyon için kısa bir gecikme
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Son senkronizasyon zamanını al.
 * @returns {Promise<number|null>} Son senkronizasyon zamanı.
 */
export const getLastSyncTime = async () => {
  try {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return lastSync ? parseInt(lastSync, 10) : null;
  } catch (error) {
    console.error('Get last sync time error:', error);
    return null;
  }
};

/**
 * Offline modda mı kontrol et.
 * @returns {Promise<boolean>} Offline modda ise true.
 */
export const isOfflineMode = async () => {
  const isOnline = await checkNetworkStatus();
  return !isOnline;
};

/**
 * Benzersiz ID oluştur.
 * @returns {string} Benzersiz ID.
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Offline mod yardımcı fonksiyonları
 */
export const offlineUtils = {
  /**
   * Kartvizit oluşturma işlemini kuyruğa ekle
   */
  queueCardCreation: async (cardData) => {
    return addToSyncQueue({
      type: 'CREATE_CARD',
      data: cardData,
    });
  },
  
  /**
   * Kartvizit güncelleme işlemini kuyruğa ekle
   */
  queueCardUpdate: async (cardData) => {
    return addToSyncQueue({
      type: 'UPDATE_CARD',
      data: cardData,
    });
  },
  
  /**
   * Kartvizit silme işlemini kuyruğa ekle
   */
  queueCardDeletion: async (cardId) => {
    return addToSyncQueue({
      type: 'DELETE_CARD',
      data: { id: cardId },
    });
  },
  
  /**
   * Koleksiyon işlemlerini kuyruğa ekle
   */
  queueCollectionOperation: async (operation, collectionData) => {
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