// ==================== SERVICE RESPONSES ====================

export interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

// ==================== VALIDATION ====================

export interface ValidationResult {
  isValid: boolean;
  message: string;
  field?: string;
}

// ==================== OFFLINE ====================

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  data: Record<string, unknown>;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
}

export type SyncOperationType =
  | 'CREATE_CARD'
  | 'UPDATE_CARD'
  | 'DELETE_CARD'
  | 'COLLECTION_CREATE'
  | 'COLLECTION_UPDATE'
  | 'COLLECTION_DELETE'
  | 'COLLECTION_ADD_CARD'
  | 'COLLECTION_REMOVE_CARD';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  maxAge: number;
  version: string;
}

export interface CacheStats {
  totalItems: number;
  validItems: number;
  expiredItems: number;
  totalSize: string;
}

// ==================== CARD STATS ====================

export interface CardStats {
  totalCards: number;
  favoriteCards: number;
  uniqueTags: number;
  tags: string[];
}

export interface CollectionStats {
  totalCollections: number;
  totalCardsInCollections: number;
  averageCardsPerCollection: number;
}
