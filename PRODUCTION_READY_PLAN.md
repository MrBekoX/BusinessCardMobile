# CardVault Production-Ready Donusum Plani

> **Hedef:** Projeyi SOLID prensipleri ve guvenlik standartlarina uygun production-ready seviyesine getirmek.
>
> **Mevcut Durum:** 32 JavaScript dosyasi, ~70-75% SOLID uyumluluk
> **Hedef Durum:** ~55 TypeScript dosyasi, %95+ SOLID uyumluluk, enterprise-grade guvenlik

---

## Icindekiler

1. [Faz 1: TypeScript Migration](#faz-1-typescript-migration)
2. [Faz 2: SOLID Prensipleri Iyilestirmeleri](#faz-2-solid-prensipleri-iyilestirmeleri)
3. [Faz 3: Guvenlik Iyilestirmeleri](#faz-3-guvenlik-iyilestirmeleri)
4. [Faz 4: Error Handling Standardizasyonu](#faz-4-error-handling-standardizasyonu)
5. [Faz 5: Backend (Supabase) Iyilestirmeleri](#faz-5-backend-supabase-iyilestirmeleri)
6. [Faz 6: Test Suite](#faz-6-test-suite)
7. [Implementasyon Sirasi](#implementasyon-sirasi)
8. [Dogrulama Plani](#dogrulama-plani)

---

## Faz 1: TypeScript Migration

### 1.1 TypeScript Yapilandirmasi

**Gerekli Paketler:**
```bash
npm install --save-dev typescript @types/react-native @types/react @types/jest
```

**Yeni Dosya: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2019"],
    "jsx": "react-native",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@lib/*": ["src/lib/*"],
      "@types/*": ["src/types/*"],
      "@context/*": ["src/context/*"],
      "@config/*": ["src/config/*"],
      "@navigation/*": ["src/navigation/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"]
}
```

**package.json Guncelleme:**
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

### 1.2 Tip Tanimlamalari

**Yeni Dosya: `src/types/models.ts`**
```typescript
// ==================== USER & AUTH ====================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  user_metadata?: UserMetadata;
}

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

// ==================== CARD ====================

export interface Card {
  id: string;
  user_id: string;
  company_name: string;
  position?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  profile_image?: string;
  logo_image?: string;
  instagram_url?: string;
  linkedin_url?: string;
  x_url?: string;
  youtube_url?: string;
  facebook_url?: string;
  qr_code_data?: string;
  is_favorite: boolean;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCardInput {
  company_name: string;
  position?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  profile_image?: string;
  logo_image?: string;
  instagram_url?: string;
  linkedin_url?: string;
  x_url?: string;
  youtube_url?: string;
  facebook_url?: string;
  notes?: string;
  tags?: string[];
}

export type UpdateCardInput = Partial<CreateCardInput> & {
  is_favorite?: boolean;
  qr_code_data?: string;
};

// ==================== COLLECTION ====================

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  card_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export type UpdateCollectionInput = Partial<CreateCollectionInput>;

export interface CollectionCard {
  id: string;
  collection_id: string;
  card_id: string;
  position: number;
  added_at: string;
}

// ==================== OPTIONS ====================

export interface GetCardsOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'company_name' | 'name';
  sortOrder?: 'asc' | 'desc';
  isFavorite?: boolean | null;
  tags?: string[] | null;
}

export interface GetCollectionsOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'name';
  sortOrder?: 'asc' | 'desc';
}
```

**Yeni Dosya: `src/types/api.ts`**
```typescript
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
```

**Yeni Dosya: `src/types/services.ts`**
```typescript
import {
  Card,
  CreateCardInput,
  UpdateCardInput,
  GetCardsOptions,
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  GetCollectionsOptions,
  CardStats,
  CollectionStats,
} from './models';
import { ServiceResponse, AuthResponse, ValidationResult } from './api';

// ==================== CARD SERVICE ====================

export interface ICardService {
  getCards(userId: string, options?: GetCardsOptions): Promise<ServiceResponse<Card[]>>;
  getCardById(cardId: string, userId: string): Promise<ServiceResponse<Card>>;
  searchCards(userId: string, searchQuery: string): Promise<ServiceResponse<Card[]>>;
  createCard(cardData: CreateCardInput, userId: string): Promise<ServiceResponse<Card>>;
  updateCard(cardId: string, updates: UpdateCardInput, userId: string): Promise<ServiceResponse<Card>>;
  deleteCard(cardId: string, userId: string): Promise<ServiceResponse<void>>;
  toggleCardFavorite(cardId: string, isFavorite: boolean, userId: string): Promise<ServiceResponse<Card>>;
  addTagToCard(cardId: string, tag: string, userId: string): Promise<ServiceResponse<Card>>;
  removeTagFromCard(cardId: string, tag: string, userId: string): Promise<ServiceResponse<Card>>;
  bulkDeleteCards(cardIds: string[], userId: string): Promise<ServiceResponse<void>>;
  getFavoriteCards(userId: string): Promise<ServiceResponse<Card[]>>;
  getCardsByTags(userId: string, tags: string[]): Promise<ServiceResponse<Card[]>>;
  getCardStats(userId: string): Promise<ServiceResponse<CardStats>>;
}

// ==================== COLLECTION SERVICE ====================

export interface ICollectionService {
  getCollections(userId: string, options?: GetCollectionsOptions): Promise<ServiceResponse<Collection[]>>;
  getCollectionById(collectionId: string, userId: string): Promise<ServiceResponse<Collection>>;
  createCollection(data: CreateCollectionInput, userId: string): Promise<ServiceResponse<Collection>>;
  updateCollection(collectionId: string, updates: UpdateCollectionInput, userId: string): Promise<ServiceResponse<Collection>>;
  deleteCollection(collectionId: string, userId: string): Promise<ServiceResponse<void>>;
  getCardsInCollection(collectionId: string, userId: string): Promise<ServiceResponse<Card[]>>;
  addCardToCollection(collectionId: string, cardId: string, userId: string, position?: number): Promise<ServiceResponse<void>>;
  removeCardFromCollection(collectionId: string, cardId: string, userId: string): Promise<ServiceResponse<void>>;
  reorderCardsInCollection(collectionId: string, cardPositions: { cardId: string; position: number }[], userId: string): Promise<ServiceResponse<void>>;
  bulkAddCardsToCollection(collectionId: string, cardIds: string[], userId: string): Promise<ServiceResponse<void>>;
  bulkRemoveCardsFromCollection(collectionId: string, cardIds: string[], userId: string): Promise<ServiceResponse<void>>;
  getCollectionStats(userId: string): Promise<ServiceResponse<CollectionStats>>;
}

// ==================== AUTH SERVICE ====================

export interface SignUpInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface IAuthService {
  signIn(email: string, password: string): Promise<AuthResponse>;
  signUp(userData: SignUpInput): Promise<AuthResponse>;
  signOut(): Promise<ServiceResponse<void>>;
  resetPassword(email: string): Promise<ServiceResponse<void>>;
  updatePassword(newPassword: string): Promise<ServiceResponse<void>>;
  updateProfile(profileData: Record<string, unknown>): Promise<ServiceResponse<void>>;
}

// ==================== VALIDATOR ====================

export type ValidationType = 'email' | 'password' | 'phone' | 'url' | 'text' | 'required';

export interface IValidator {
  validate(value: unknown): ValidationResult;
}

export interface ValidatorOptions {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  customMessage?: string;
}
```

**Yeni Dosya: `src/types/navigation.ts`**
```typescript
import { NavigatorScreenParams } from '@react-navigation/native';

// ==================== AUTH STACK ====================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

// ==================== APP STACK ====================

export type AppTabParamList = {
  Home: undefined;
  Cards: undefined;
  QRScanner: undefined;
  Collections: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>;
  CardDetail: { cardId: string };
  CardCreate: { editCardId?: string } | undefined;
  CollectionDetail: { collectionId: string };
};

// ==================== ROOT ====================

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

// ==================== SCREEN PROPS ====================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

**Yeni Dosya: `src/types/index.ts`**
```typescript
// Models
export * from './models';

// API Types
export * from './api';

// Service Interfaces
export * from './services';

// Navigation Types
export * from './navigation';
```

### 1.3 Dosya Donusum Listesi (Sirasiyla)

**Grup 1: Core (Oncelikli)**
| # | Mevcut Dosya | Yeni Dosya | Notlar |
|---|-------------|------------|--------|
| 1 | - | `src/types/models.ts` | Yeni |
| 2 | - | `src/types/api.ts` | Yeni |
| 3 | - | `src/types/services.ts` | Yeni |
| 4 | - | `src/types/navigation.ts` | Yeni |
| 5 | - | `src/types/index.ts` | Yeni |
| 6 | `src/utils/validators.js` | `src/utils/validators.ts` | Donusum |
| 7 | `src/utils/formatters.js` | `src/utils/formatters.ts` | Donusum |
| 8 | `src/config/settings.js` | `src/config/settings.ts` | Donusum |
| 9 | `src/config/errorMessages.js` | `src/config/errorMessages.ts` | Donusum |
| 10 | `src/constants/theme.js` | `src/constants/theme.ts` | Donusum |

**Grup 2: Library & Services**
| # | Mevcut Dosya | Yeni Dosya | Notlar |
|---|-------------|------------|--------|
| 11 | - | `src/lib/logger.ts` | Yeni |
| 12 | - | `src/lib/secureStorage.ts` | Yeni |
| 13 | - | `src/lib/rateLimiter.ts` | Yeni |
| 14 | - | `src/lib/container.ts` | Yeni |
| 15 | `src/lib/supabaseClient.js` | `src/lib/supabaseClient.ts` | Donusum |
| 16 | `src/lib/databaseSetup.js` | `src/lib/databaseSetup.ts` | Donusum |
| 17 | `src/services/cardService.js` | `src/services/cardService.ts` | Donusum |
| 18 | `src/services/collectionService.js` | `src/services/collectionService.ts` | Donusum |
| 19 | `src/services/profileService.js` | `src/services/profileService.ts` | Donusum |
| 20 | `src/services/qrService.js` | `src/services/qrService.ts` | Donusum |
| 21 | `src/services/shareService.js` | `src/services/shareService.ts` | Donusum |
| 22 | `src/services/offlineService.js` | `src/services/offlineService.ts` | Donusum |

**Grup 3: Context**
| # | Mevcut Dosya | Yeni Dosya | Notlar |
|---|-------------|------------|--------|
| 23 | `src/context/AuthContext.js` | `src/context/AuthContext.tsx` | Donusum |
| 24 | `src/context/ThemeContext.js` | `src/context/ThemeContext.tsx` | Donusum |

**Grup 4: Components**
| # | Mevcut Dosya | Yeni Dosya | Notlar |
|---|-------------|------------|--------|
| 25 | `src/components/common/Card.js` | `src/components/common/Card.tsx` | Donusum |
| 26 | `src/components/common/CustomInput.js` | `src/components/common/CustomInput.tsx` | Donusum |
| 27 | `src/components/common/MemoizedButton.js` | `src/components/common/MemoizedButton.tsx` | Donusum |
| 28 | - | `src/components/ErrorBoundary.tsx` | Yeni |

**Grup 5: Navigation**
| # | Mevcut Dosya | Yeni Dosya | Notlar |
|---|-------------|------------|--------|
| 29 | `src/navigation/linking.js` | `src/navigation/linking.ts` | Donusum |
| 30 | `src/navigation/AuthNavigator.js` | `src/navigation/AuthNavigator.tsx` | Donusum |
| 31 | `src/navigation/AppNavigator.js` | `src/navigation/AppNavigator.tsx` | Donusum |

**Grup 6: Screens**
| # | Mevcut Dosya | Yeni Dosya | Notlar |
|---|-------------|------------|--------|
| 32 | `src/screens/Auth/LoginScreen.js` | `src/screens/Auth/LoginScreen.tsx` | Donusum |
| 33 | `src/screens/Auth/RegisterScreen.js` | `src/screens/Auth/RegisterScreen.tsx` | Donusum |
| 34 | `src/screens/Auth/ResetPasswordScreen.js` | `src/screens/Auth/ResetPasswordScreen.tsx` | Donusum |
| 35 | `src/screens/App/HomeScreen.js` | `src/screens/App/HomeScreen.tsx` | Donusum |
| 36 | `src/screens/App/CardListScreen.js` | `src/screens/App/CardListScreen.tsx` | Donusum |
| 37 | `src/screens/App/CardCreateScreen.js` | `src/screens/App/CardCreateScreen.tsx` | Donusum |
| 38 | `src/screens/App/CardDetailScreen.js` | `src/screens/App/CardDetailScreen.tsx` | Donusum |
| 39 | `src/screens/App/QRScannerScreen.js` | `src/screens/App/QRScannerScreen.tsx` | Donusum |
| 40 | `src/screens/App/CollectionsScreen.js` | `src/screens/App/CollectionsScreen.tsx` | Donusum |
| 41 | `src/screens/App/SettingsScreen.js` | `src/screens/App/SettingsScreen.tsx` | Donusum |

---

## Faz 2: SOLID Prensipleri Iyilestirmeleri

### 2.1 Dependency Injection Container

**Yeni Dosya: `src/lib/container.ts`**
```typescript
type ServiceFactory<T> = () => T;

class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, unknown> = new Map();
  private factories: Map<string, ServiceFactory<unknown>> = new Map();

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  registerFactory<T>(key: string, factory: ServiceFactory<T>): void {
    this.factories.set(key, factory);
  }

  resolve<T>(key: string): T {
    // Oncelikle kayitli servisi kontrol et
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    // Factory varsa calistir ve kaydet
    if (this.factories.has(key)) {
      const factory = this.factories.get(key) as ServiceFactory<T>;
      const service = factory();
      this.services.set(key, service);
      return service;
    }

    throw new Error(`Service not found: ${key}`);
  }

  has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = ServiceContainer.getInstance();

// Service keys
export const SERVICE_KEYS = {
  CARD_SERVICE: 'cardService',
  COLLECTION_SERVICE: 'collectionService',
  AUTH_SERVICE: 'authService',
  PROFILE_SERVICE: 'profileService',
  QR_SERVICE: 'qrService',
  SHARE_SERVICE: 'shareService',
  OFFLINE_SERVICE: 'offlineService',
  LOGGER: 'logger',
  SECURE_STORAGE: 'secureStorage',
  RATE_LIMITER: 'rateLimiter',
} as const;
```

### 2.2 Repository Pattern

**Yeni Dosya: `src/repositories/BaseRepository.ts`**
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { ServiceResponse } from '@/types';
import { Logger } from '@/lib/logger';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected client: SupabaseClient;
  protected tableName: string;
  protected logger: Logger;

  constructor(client: SupabaseClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
    this.logger = new Logger(`Repository:${tableName}`);
  }

  async findById(id: string, userId: string): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      this.logger.error('findById failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async findAll(userId: string, options: QueryOptions = {}): Promise<ServiceResponse<T[]>> {
    try {
      const {
        limit = 100,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filters = {},
      } = options;

      let query = this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      this.logger.error('findAll failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async create(data: Partial<T>, userId: string): Promise<ServiceResponse<T>> {
    try {
      const { data: created, error } = await this.client
        .from(this.tableName)
        .insert([{ ...data, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: created };
    } catch (error) {
      this.logger.error('create failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async update(id: string, data: Partial<T>, userId: string): Promise<ServiceResponse<T>> {
    try {
      const { data: updated, error } = await this.client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: updated };
    } catch (error) {
      this.logger.error('update failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async delete(id: string, userId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      this.logger.error('delete failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }
}
```

**Yeni Dosya: `src/repositories/CardRepository.ts`**
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository';
import { Card, ServiceResponse } from '@/types';

export class CardRepository extends BaseRepository<Card> {
  constructor(client: SupabaseClient) {
    super(client, 'cards');
  }

  async search(userId: string, searchQuery: string): Promise<ServiceResponse<Card[]>> {
    try {
      if (!searchQuery || searchQuery.trim() === '') {
        return this.findAll(userId);
      }

      const { data, error } = await this.client.rpc('search_cards', {
        user_id_param: userId,
        search_query: searchQuery,
      });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      this.logger.error('search failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async findFavorites(userId: string): Promise<ServiceResponse<Card[]>> {
    return this.findAll(userId, { filters: { is_favorite: true } });
  }

  async findByTags(userId: string, tags: string[]): Promise<ServiceResponse<Card[]>> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .contains('tags', tags);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      this.logger.error('findByTags failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async bulkDelete(ids: string[], userId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .in('id', ids)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      this.logger.error('bulkDelete failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }
}
```

### 2.3 Validation Strategy Pattern

**Yeni Dosya: `src/validators/ValidationStrategy.ts`**
```typescript
import { ValidationResult, ValidatorOptions } from '@/types';

export interface IValidationStrategy {
  validate(value: unknown): ValidationResult;
}

// Email Validator
export class EmailValidator implements IValidationStrategy {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validate(value: unknown): ValidationResult {
    if (!value || typeof value !== 'string') {
      return { isValid: false, message: 'Email adresi gerekli.' };
    }

    if (!this.emailRegex.test(value.trim())) {
      return { isValid: false, message: 'Gecersiz email formatı.' };
    }

    return { isValid: true, message: 'Gecerli' };
  }
}

// Password Validator
export class PasswordValidator implements IValidationStrategy {
  private minLength = 8;

  validate(value: unknown): ValidationResult {
    if (!value || typeof value !== 'string') {
      return { isValid: false, message: 'Sifre gerekli.' };
    }

    if (value.length < this.minLength) {
      return { isValid: false, message: `Sifre en az ${this.minLength} karakter olmali.` };
    }

    if (!/[A-Z]/.test(value)) {
      return { isValid: false, message: 'Sifre en az bir buyuk harf icermeli.' };
    }

    if (!/[a-z]/.test(value)) {
      return { isValid: false, message: 'Sifre en az bir kucuk harf icermeli.' };
    }

    if (!/\d/.test(value)) {
      return { isValid: false, message: 'Sifre en az bir rakam icermeli.' };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return { isValid: false, message: 'Sifre en az bir ozel karakter icermeli.' };
    }

    return { isValid: true, message: 'Gecerli' };
  }
}

// Phone Validator (Turkish format)
export class PhoneValidator implements IValidationStrategy {
  private phoneRegex = /^(\+90|0)?5\d{9}$/;

  validate(value: unknown): ValidationResult {
    if (!value || typeof value !== 'string') {
      return { isValid: true, message: 'Gecerli' }; // Optional field
    }

    const cleanPhone = value.replace(/\s/g, '');
    if (!this.phoneRegex.test(cleanPhone)) {
      return { isValid: false, message: 'Gecersiz telefon numarasi formati.' };
    }

    return { isValid: true, message: 'Gecerli' };
  }
}

// URL Validator
export class UrlValidator implements IValidationStrategy {
  validate(value: unknown): ValidationResult {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return { isValid: true, message: 'Gecerli' }; // Optional field
    }

    try {
      new URL(value);
      return { isValid: true, message: 'Gecerli' };
    } catch {
      try {
        new URL(`https://${value}`);
        return { isValid: true, message: 'Gecerli' };
      } catch {
        return { isValid: false, message: 'Gecersiz URL formatı.' };
      }
    }
  }
}

// Text Validator
export class TextValidator implements IValidationStrategy {
  constructor(private options: ValidatorOptions = {}) {}

  validate(value: unknown): ValidationResult {
    const {
      minLength = 0,
      maxLength = Infinity,
      required = false,
      pattern,
      customMessage,
    } = this.options;

    const text = typeof value === 'string' ? value.trim() : '';

    if (required && !text) {
      return { isValid: false, message: customMessage || 'Bu alan zorunludur.' };
    }

    if (text && text.length < minLength) {
      return { isValid: false, message: customMessage || `En az ${minLength} karakter gerekli.` };
    }

    if (text && text.length > maxLength) {
      return { isValid: false, message: customMessage || `En fazla ${maxLength} karakter girebilirsiniz.` };
    }

    if (text && pattern && !pattern.test(text)) {
      return { isValid: false, message: customMessage || 'Gecersiz format.' };
    }

    return { isValid: true, message: 'Gecerli' };
  }
}

// Validator Factory
export class ValidatorFactory {
  static create(type: string, options?: ValidatorOptions): IValidationStrategy {
    switch (type) {
      case 'email':
        return new EmailValidator();
      case 'password':
        return new PasswordValidator();
      case 'phone':
        return new PhoneValidator();
      case 'url':
        return new UrlValidator();
      case 'text':
        return new TextValidator(options);
      default:
        return new TextValidator(options);
    }
  }
}
```

---

## Faz 3: Guvenlik Iyilestirmeleri

### 3.1 Production Logger

**Yeni Dosya: `src/lib/logger.ts`**
```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  context: string;
  message: string;
  data?: unknown;
}

// Hassas alanlar - bu alanlar loglanmayacak
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'secret',
  'credit_card',
  'ssn',
  'email', // Kismi maskeleme yapilacak
  'phone', // Kismi maskeleme yapilacak
];

export class Logger {
  private static globalLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  static setGlobalLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | unknown): void {
    const errorData = error instanceof Error
      ? { name: error.name, message: error.message, stack: __DEV__ ? error.stack : undefined }
      : error;
    this.log(LogLevel.ERROR, message, errorData);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < Logger.globalLevel) return;

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      context: this.context,
      message,
      data: data ? this.maskSensitiveData(data) : undefined,
    };

    const levelName = LogLevel[level];
    const prefix = `[${entry.timestamp}] [${levelName}] [${this.context}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, entry.data || '');
        break;
    }

    // Production'da hata raporlama servisine gonder
    // if (!__DEV__ && level >= LogLevel.ERROR) {
    //   this.reportToService(entry);
    // }
  }

  private maskSensitiveData(data: unknown): unknown {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        if (lowerKey.includes('email') && typeof value === 'string') {
          // Email kismi maskeleme: j***@example.com
          masked[key] = this.maskEmail(value);
        } else if (lowerKey.includes('phone') && typeof value === 'string') {
          // Telefon kismi maskeleme: ***XXX
          masked[key] = this.maskPhone(value);
        } else {
          masked[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object') {
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***@***';
    return `${local[0]}***@${domain}`;
  }

  private maskPhone(phone: string): string {
    if (phone.length < 4) return '***';
    return `***${phone.slice(-4)}`;
  }
}

// Global logger instance
export const logger = new Logger('App');
```

### 3.2 Secure Storage

**Yeni Dosya: `src/lib/secureStorage.ts`**
```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';

const logger = new Logger('SecureStorage');

// Secure Store icin key prefix
const SECURE_PREFIX = 'secure_';

// Maksimum deger boyutu (SecureStore limiti: 2048 bytes)
const MAX_SECURE_VALUE_SIZE = 2048;

export class SecureStorageService {
  /**
   * Hassas veriyi guvenli depoya kaydet
   */
  async setSecureItem(key: string, value: string): Promise<boolean> {
    try {
      // Deger cok buyukse parca parca kaydet
      if (value.length > MAX_SECURE_VALUE_SIZE) {
        return this.setLargeSecureItem(key, value);
      }

      await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}`, value);
      logger.debug(`Secure item set: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set secure item: ${key}`, error);
      return false;
    }
  }

  /**
   * Hassas veriyi guvenli depodan oku
   */
  async getSecureItem(key: string): Promise<string | null> {
    try {
      // Once buyuk veri var mi kontrol et
      const chunkCount = await this.getChunkCount(key);
      if (chunkCount > 0) {
        return this.getLargeSecureItem(key, chunkCount);
      }

      const value = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}`);
      return value;
    } catch (error) {
      logger.error(`Failed to get secure item: ${key}`, error);
      return null;
    }
  }

  /**
   * Hassas veriyi guvenli depodan sil
   */
  async removeSecureItem(key: string): Promise<boolean> {
    try {
      // Buyuk veri parcalarini da sil
      const chunkCount = await this.getChunkCount(key);
      if (chunkCount > 0) {
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}_chunk_${i}`);
        }
        await AsyncStorage.removeItem(`${SECURE_PREFIX}${key}_chunks`);
      }

      await SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}`);
      logger.debug(`Secure item removed: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove secure item: ${key}`, error);
      return false;
    }
  }

  /**
   * Tum guvenli verileri temizle
   */
  async clearAll(): Promise<boolean> {
    try {
      // AsyncStorage'dan secure key'leri bul ve sil
      const allKeys = await AsyncStorage.getAllKeys();
      const secureMetaKeys = allKeys.filter(k => k.startsWith(`${SECURE_PREFIX}`) && k.endsWith('_chunks'));

      for (const metaKey of secureMetaKeys) {
        const baseKey = metaKey.replace(`${SECURE_PREFIX}`, '').replace('_chunks', '');
        await this.removeSecureItem(baseKey);
      }

      logger.info('All secure items cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear all secure items', error);
      return false;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async setLargeSecureItem(key: string, value: string): Promise<boolean> {
    try {
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += MAX_SECURE_VALUE_SIZE) {
        chunks.push(value.slice(i, i + MAX_SECURE_VALUE_SIZE));
      }

      // Her parcayi kaydet
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}_chunk_${i}`, chunks[i]);
      }

      // Parca sayisini meta olarak kaydet
      await AsyncStorage.setItem(`${SECURE_PREFIX}${key}_chunks`, chunks.length.toString());

      logger.debug(`Large secure item set: ${key} (${chunks.length} chunks)`);
      return true;
    } catch (error) {
      logger.error(`Failed to set large secure item: ${key}`, error);
      return false;
    }
  }

  private async getLargeSecureItem(key: string, chunkCount: number): Promise<string> {
    const chunks: string[] = [];

    for (let i = 0; i < chunkCount; i++) {
      const chunk = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}_chunk_${i}`);
      if (chunk) chunks.push(chunk);
    }

    return chunks.join('');
  }

  private async getChunkCount(key: string): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(`${SECURE_PREFIX}${key}_chunks`);
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }
}

// Singleton instance
export const secureStorage = new SecureStorageService();

// Storage keys
export const SECURE_KEYS = {
  AUTH_SESSION: 'auth_session',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SYNC_QUEUE: 'sync_queue',
} as const;
```

### 3.3 Rate Limiter

**Yeni Dosya: `src/lib/rateLimiter.ts`**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';

const logger = new Logger('RateLimiter');

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

const RATE_LIMIT_PREFIX = '@cardvault_rate_';

export class RateLimiter {
  /**
   * Rate limit kontrolu yap
   * @param key - Benzersiz anahtar (ornegin: `login_${email}`)
   * @param maxAttempts - Maksimum deneme sayisi
   * @param windowMs - Zaman penceresi (milisaniye)
   * @returns true: izin verildi, false: limit asildi
   */
  async checkLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
    try {
      const record = await this.getRecord(key);

      if (!record) {
        return true; // Ilk deneme
      }

      const now = Date.now();
      const windowStart = now - windowMs;

      // Zaman penceresi disindaysa sifirla
      if (record.firstAttempt < windowStart) {
        await this.removeRecord(key);
        return true;
      }

      // Limit kontrolu
      if (record.count >= maxAttempts) {
        const remainingTime = Math.ceil((record.firstAttempt + windowMs - now) / 1000);
        logger.warn(`Rate limit exceeded for ${key}. Retry after ${remainingTime}s`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Rate limit check failed', error);
      return true; // Hata durumunda izin ver
    }
  }

  /**
   * Deneme kaydet
   */
  async recordAttempt(key: string): Promise<void> {
    try {
      const record = await this.getRecord(key);
      const now = Date.now();

      const newRecord: AttemptRecord = {
        count: (record?.count || 0) + 1,
        firstAttempt: record?.firstAttempt || now,
        lastAttempt: now,
      };

      await AsyncStorage.setItem(
        `${RATE_LIMIT_PREFIX}${key}`,
        JSON.stringify(newRecord)
      );

      logger.debug(`Attempt recorded for ${key}: ${newRecord.count}`);
    } catch (error) {
      logger.error('Failed to record attempt', error);
    }
  }

  /**
   * Basarili islemden sonra kayitlari sifirla
   */
  async resetAttempts(key: string): Promise<void> {
    try {
      await this.removeRecord(key);
      logger.debug(`Attempts reset for ${key}`);
    } catch (error) {
      logger.error('Failed to reset attempts', error);
    }
  }

  /**
   * Kalan deneme sayisini al
   */
  async getRemainingAttempts(key: string, maxAttempts: number): Promise<number> {
    try {
      const record = await this.getRecord(key);
      if (!record) return maxAttempts;
      return Math.max(0, maxAttempts - record.count);
    } catch (error) {
      logger.error('Failed to get remaining attempts', error);
      return maxAttempts;
    }
  }

  /**
   * Bekleme suresini al (saniye)
   */
  async getWaitTime(key: string, windowMs: number): Promise<number> {
    try {
      const record = await this.getRecord(key);
      if (!record) return 0;

      const now = Date.now();
      const windowEnd = record.firstAttempt + windowMs;

      if (windowEnd > now) {
        return Math.ceil((windowEnd - now) / 1000);
      }

      return 0;
    } catch (error) {
      logger.error('Failed to get wait time', error);
      return 0;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async getRecord(key: string): Promise<AttemptRecord | null> {
    try {
      const data = await AsyncStorage.getItem(`${RATE_LIMIT_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async removeRecord(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${RATE_LIMIT_PREFIX}${key}`);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit presets
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 5 * 60 * 1000 }, // 5 dakikada 5 deneme
  REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 1 saatte 3 deneme
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 1 saatte 3 deneme
  API_CALL: { maxAttempts: 100, windowMs: 60 * 1000 }, // 1 dakikada 100 istek
} as const;
```

### 3.4 Input Sanitizer

**Yeni Dosya: `src/utils/sanitizer.ts`**
```typescript
/**
 * Input Sanitization Utilities
 * XSS ve injection saldirilarina karsi koruma
 */

// HTML entity map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

// Tehlikeli URL scheme'leri
const DANGEROUS_SCHEMES = [
  'javascript:',
  'vbscript:',
  'data:text/html',
  'data:application/x-javascript',
];

export class InputSanitizer {
  /**
   * Genel metin temizleme
   * - Boslara trim
   * - Null byte'lari kaldir
   * - Control karakterlerini kaldir
   */
  static sanitizeString(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      // Null bytes
      .replace(/\0/g, '')
      // Control characters (tab ve newline haric)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * HTML entity encoding
   * XSS saldirilarina karsi koruma
   */
  static escapeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input.replace(/[&<>"'`=\/]/g, char => HTML_ENTITIES[char] || char);
  }

  /**
   * URL temizleme ve dogrulama
   */
  static sanitizeUrl(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    const trimmed = input.trim().toLowerCase();

    // Tehlikeli scheme kontrolu
    for (const scheme of DANGEROUS_SCHEMES) {
      if (trimmed.startsWith(scheme)) {
        return '';
      }
    }

    // Protokol yoksa https ekle
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${input.trim()}`;
    }

    return input.trim();
  }

  /**
   * Email temizleme
   */
  static sanitizeEmail(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      .toLowerCase()
      // Sadece gecerli email karakterleri
      .replace(/[^a-z0-9._%+-@]/gi, '');
  }

  /**
   * Telefon numarasi temizleme
   */
  static sanitizePhone(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    // Sadece rakamlar ve + karakteri
    return input.replace(/[^\d+]/g, '');
  }

  /**
   * Arama sorgusu temizleme
   */
  static sanitizeSearchQuery(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      // SQL injection karakterlerini kaldir
      .replace(/['";\\]/g, '')
      // Maksimum uzunluk
      .slice(0, 100);
  }

  /**
   * Deep link path temizleme
   */
  static sanitizeDeepLinkPath(path: string): string {
    if (!path || typeof path !== 'string') return '';

    return path
      // Path traversal engelle
      .replace(/\.\./g, '')
      // Tehlikeli karakterleri kaldir
      .replace(/[<>'"`;\\]/g, '')
      // Sadece izin verilen karakterler
      .replace(/[^a-zA-Z0-9\-_\/]/g, '');
  }

  /**
   * UUID format dogrulama
   */
  static isValidUUID(input: string): boolean {
    if (!input || typeof input !== 'string') return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(input);
  }

  /**
   * Kullanici girdisi icin goruntuleme oncesi temizleme
   */
  static sanitizeForDisplay(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    return this.escapeHtml(this.sanitizeString(input));
  }

  /**
   * Toplu veri temizleme
   */
  static sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    rules: Partial<Record<keyof T, 'string' | 'email' | 'phone' | 'url'>>
  ): T {
    const sanitized = { ...obj };

    for (const [key, rule] of Object.entries(rules)) {
      const value = sanitized[key as keyof T];
      if (typeof value !== 'string') continue;

      switch (rule) {
        case 'email':
          (sanitized as Record<string, unknown>)[key] = this.sanitizeEmail(value);
          break;
        case 'phone':
          (sanitized as Record<string, unknown>)[key] = this.sanitizePhone(value);
          break;
        case 'url':
          (sanitized as Record<string, unknown>)[key] = this.sanitizeUrl(value);
          break;
        default:
          (sanitized as Record<string, unknown>)[key] = this.sanitizeString(value);
      }
    }

    return sanitized;
  }
}

// Shortcut exports
export const {
  sanitizeString,
  escapeHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeSearchQuery,
  sanitizeDeepLinkPath,
  isValidUUID,
  sanitizeForDisplay,
  sanitizeObject,
} = InputSanitizer;
```

### 3.5 Environment Security

**Yeni Dosya: `.env.example`**
```
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration (optional)
APP_ENV=development
```

**Yeni Dosya: `src/config/environment.ts`**
```typescript
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { Logger } from '@/lib/logger';

const logger = new Logger('Environment');

// Zorunlu environment degiskenleri
const REQUIRED_ENV_VARS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  isProduction: boolean;
  isDevelopment: boolean;
}

function validateEnvironment(): void {
  const missing: string[] = [];

  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }

  logger.info('Environment validation passed');
}

// Uygulama baslarken dogrula
validateEnvironment();

export const environment: EnvironmentConfig = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  },
  isProduction: !__DEV__,
  isDevelopment: __DEV__,
};

export default environment;
```

---

## Faz 4: Error Handling Standardizasyonu

### 4.1 Custom Error Classes

**Yeni Dosya: `src/errors/AppError.ts`**
```typescript
export enum ErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // General
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
    this.context = context;

    // Prototype chain'i duzelt
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}

// Spesifik error siniflari
export class AuthenticationError extends AppError {
  constructor(code: ErrorCode, message: string, originalError?: Error) {
    super(code, message, originalError);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string, originalError?: Error) {
    super(ErrorCode.VALIDATION_FAILED, message, originalError, { field });
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(ErrorCode.NETWORK_ERROR, message, originalError);
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(ErrorCode.DATABASE_ERROR, message, originalError);
    this.name = 'DatabaseError';
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, undefined, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
```

### 4.2 Global Error Handler

**Yeni Dosya: `src/lib/errorHandler.ts`**
```typescript
import { Logger } from './logger';
import { AppError, ErrorCode } from '@/errors/AppError';
import { ERROR_MESSAGES } from '@/config/errorMessages';

const logger = new Logger('ErrorHandler');

export class GlobalErrorHandler {
  /**
   * Hatayi isle ve kullanici dostu mesaj don
   */
  static handle(error: unknown, context?: string): string {
    // AppError ise
    if (error instanceof AppError) {
      logger.error(`[${context || 'Unknown'}] ${error.code}: ${error.message}`, error);
      return this.getMessageForCode(error.code);
    }

    // Standard Error ise
    if (error instanceof Error) {
      logger.error(`[${context || 'Unknown'}] ${error.name}: ${error.message}`, error);

      // Bilinen hata mesajlarini esle
      return this.matchErrorMessage(error.message);
    }

    // Bilinmeyen hata
    logger.error(`[${context || 'Unknown'}] Unknown error`, error);
    return ERROR_MESSAGES.UNEXPECTED_ERROR;
  }

  /**
   * Hata koduna gore mesaj al
   */
  private static getMessageForCode(code: ErrorCode): string {
    const messageMap: Partial<Record<ErrorCode, string>> = {
      [ErrorCode.INVALID_CREDENTIALS]: ERROR_MESSAGES.INVALID_CREDENTIALS,
      [ErrorCode.USER_NOT_FOUND]: ERROR_MESSAGES.USER_NOT_FOUND,
      [ErrorCode.EMAIL_ALREADY_EXISTS]: ERROR_MESSAGES.EMAIL_ALREADY_IN_USE,
      [ErrorCode.WEAK_PASSWORD]: ERROR_MESSAGES.WEAK_PASSWORD,
      [ErrorCode.SESSION_EXPIRED]: ERROR_MESSAGES.SESSION_EXPIRED,
      [ErrorCode.NETWORK_ERROR]: ERROR_MESSAGES.NETWORK_REQUEST_FAILED,
      [ErrorCode.RATE_LIMIT_EXCEEDED]: ERROR_MESSAGES.TOO_MANY_REQUESTS || 'Cok fazla istek. Lutfen bekleyin.',
      [ErrorCode.VALIDATION_FAILED]: ERROR_MESSAGES.VALIDATION_ERROR || 'Gecersiz veri.',
    };

    return messageMap[code] || ERROR_MESSAGES.UNEXPECTED_ERROR;
  }

  /**
   * Hata mesajini eslestir
   */
  private static matchErrorMessage(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_REQUEST_FAILED;
    }

    if (lowerMessage.includes('timeout')) {
      return ERROR_MESSAGES.OPERATION_TIMEOUT || 'Islem zaman asimina ugradi.';
    }

    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
      return ERROR_MESSAGES.SESSION_EXPIRED;
    }

    return ERROR_MESSAGES.UNEXPECTED_ERROR;
  }
}
```

### 4.3 Error Boundary Component

**Yeni Dosya: `src/components/ErrorBoundary.tsx`**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Logger } from '@/lib/logger';

const logger = new Logger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Uncaught error in component tree', error);
    logger.error('Component stack', { componentStack: errorInfo.componentStack });

    this.props.onError?.(error, errorInfo);

    // Production'da hata raporlama servisine gonder
    // if (!__DEV__) {
    //   reportToErrorService(error, errorInfo);
    // }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir hata olustu</Text>
          <Text style={styles.message}>
            Uygulamada beklenmeyen bir hata meydana geldi.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetail}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  errorDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
```

---

## Faz 5: Backend (Supabase) Iyilestirmeleri

### 5.1 RLS Policy Guncellemeleri

**Dosya: `supabase/migrations/002_security_updates.sql`**
```sql
-- =============================================
-- GUVENLIK IYILESTIRMELERI
-- =============================================

-- 1. Auth Attempts Tablosu (Rate Limiting icin)
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'register', 'reset_password')),
  success BOOLEAN DEFAULT false,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup and queries
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_created
  ON auth_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created
  ON auth_attempts(created_at);

-- 2. Rate Limit Kontrol Fonksiyonu
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_email TEXT,
  p_attempt_type TEXT,
  p_max_attempts INT DEFAULT 5,
  p_window_minutes INT DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM auth_attempts
  WHERE email = p_email
    AND attempt_type = p_attempt_type
    AND success = false
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  RETURN v_count < p_max_attempts;
END;
$$;

-- 3. Auth Attempt Kayit Fonksiyonu
CREATE OR REPLACE FUNCTION record_auth_attempt(
  p_email TEXT,
  p_attempt_type TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO auth_attempts (email, attempt_type, success, ip_address, user_agent)
  VALUES (p_email, p_attempt_type, p_success, p_ip_address, p_user_agent);
END;
$$;

-- 4. Eski Kayitlari Temizle (Cron job icin)
CREATE OR REPLACE FUNCTION cleanup_old_auth_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth_attempts
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- 5. Cards tablosu icin ek guvenlik
-- Sensitive field'lara erisme kisitlamasi (views uzerinden)
CREATE OR REPLACE VIEW public.cards_safe AS
SELECT
  id,
  user_id,
  company_name,
  position,
  name,
  email,
  phone,
  website,
  address,
  -- Image URL'leri dogrudan expose etme
  CASE WHEN profile_image IS NOT NULL THEN true ELSE false END as has_profile_image,
  CASE WHEN logo_image IS NOT NULL THEN true ELSE false END as has_logo_image,
  instagram_url,
  linkedin_url,
  x_url,
  youtube_url,
  facebook_url,
  is_favorite,
  notes,
  tags,
  created_at,
  updated_at
FROM cards
WHERE user_id = auth.uid();

-- 6. Audit Log Tablosu (Opsiyonel ama onerilen)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON audit_logs(user_id, created_at DESC);

-- 7. Audit Log Trigger Fonksiyonu
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 8. Cards icin audit trigger
DROP TRIGGER IF EXISTS cards_audit_trigger ON cards;
CREATE TRIGGER cards_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- 9. Collections icin audit trigger
DROP TRIGGER IF EXISTS collections_audit_trigger ON collections;
CREATE TRIGGER collections_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON collections
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- 10. RLS for audit_logs (sadece okuma)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Faz 6: Test Suite

### 6.1 Jest Yapilandirmasi

**Guncellenmis `jest.config.js`:**
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'jsdom',
};
```

### 6.2 Ornek Unit Testler

**Dosya: `src/__tests__/utils/sanitizer.test.ts`**
```typescript
import {
  sanitizeString,
  escapeHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  isValidUUID,
} from '@/utils/sanitizer';

describe('InputSanitizer', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove null bytes', () => {
      expect(sanitizeString('hello\0world')).toBe('helloworld');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape all dangerous characters', () => {
      expect(escapeHtml('& < > " \' ` = /')).toBe(
        '&amp; &lt; &gt; &quot; &#x27; &#x60; &#x3D; &#x2F;'
      );
    });
  });

  describe('sanitizeUrl', () => {
    it('should block javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('should add https:// to URLs without protocol', () => {
      expect(sanitizeUrl('example.com')).toBe('https://example.com');
    });

    it('should preserve valid URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim', () => {
      expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com');
    });

    it('should remove invalid characters', () => {
      expect(sanitizeEmail('user<script>@example.com')).toBe('userscript@example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('should keep only digits and +', () => {
      expect(sanitizePhone('+90 (555) 123-45-67')).toBe('+905551234567');
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });
});
```

**Dosya: `src/__tests__/lib/rateLimiter.test.ts`**
```typescript
import { RateLimiter } from '@/lib/rateLimiter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    jest.clearAllMocks();
  });

  describe('checkLimit', () => {
    it('should allow first attempt', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await rateLimiter.checkLimit('test_key', 5, 60000);
      expect(result).toBe(true);
    });

    it('should block after max attempts', async () => {
      const record = {
        count: 5,
        firstAttempt: Date.now() - 1000, // 1 second ago
        lastAttempt: Date.now(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(record));

      const result = await rateLimiter.checkLimit('test_key', 5, 60000);
      expect(result).toBe(false);
    });

    it('should reset after window expires', async () => {
      const record = {
        count: 5,
        firstAttempt: Date.now() - 120000, // 2 minutes ago
        lastAttempt: Date.now() - 60000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(record));

      const result = await rateLimiter.checkLimit('test_key', 5, 60000);
      expect(result).toBe(true);
    });
  });

  describe('recordAttempt', () => {
    it('should increment count', async () => {
      const existingRecord = {
        count: 2,
        firstAttempt: Date.now() - 1000,
        lastAttempt: Date.now() - 500,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingRecord));

      await rateLimiter.recordAttempt('test_key');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"count":3')
      );
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return correct remaining attempts', async () => {
      const record = {
        count: 3,
        firstAttempt: Date.now(),
        lastAttempt: Date.now(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(record));

      const remaining = await rateLimiter.getRemainingAttempts('test_key', 5);
      expect(remaining).toBe(2);
    });
  });
});
```

**Dosya: `src/__tests__/services/cardService.test.ts`**
```typescript
import { CardService } from '@/services/cardService';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    rpc: jest.fn(),
  },
}));

describe('CardService', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockCard = {
    id: '123',
    user_id: mockUserId,
    company_name: 'Test Company',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCards', () => {
    it('should return cards for user', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [mockCard],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await CardService.getCards(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].company_name).toBe('Test Company');
    });

    it('should handle errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error'),
              }),
            }),
          }),
        }),
      });

      const result = await CardService.getCards(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('createCard', () => {
    it('should create a card', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCard,
              error: null,
            }),
          }),
        }),
      });

      const result = await CardService.createCard(
        { company_name: 'Test Company' },
        mockUserId
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCard);
    });
  });
});
```

---

## Implementasyon Sirasi (Onerilen)

### Hafta 1: Altyapi
- [ ] TypeScript yapilandirmasi
- [ ] Tip tanimlamalari olusturma
- [ ] Logger implementasyonu
- [ ] SecureStorage implementasyonu
- [ ] Environment yapilandirmasi

### Hafta 2: Guvenlik
- [ ] InputSanitizer implementasyonu
- [ ] RateLimiter implementasyonu
- [ ] Custom error classes
- [ ] GlobalErrorHandler

### Hafta 3: Core Donusum
- [ ] Utils TypeScript donusumu
- [ ] Config TypeScript donusumu
- [ ] Lib TypeScript donusumu
- [ ] Validation strategies

### Hafta 4: Services
- [ ] Service interfaces
- [ ] Repository pattern
- [ ] All services TypeScript donusumu
- [ ] DI container

### Hafta 5: UI Layer
- [ ] Context TypeScript donusumu
- [ ] Components TypeScript donusumu
- [ ] ErrorBoundary
- [ ] Navigation TypeScript donusumu

### Hafta 6: Screens & Tests
- [ ] All screens TypeScript donusumu
- [ ] Unit tests
- [ ] Integration tests
- [ ] Backend migrations

---

## Dogrulama Plani

### Build & Lint
```bash
# TypeScript kontrol
npm run typecheck

# Lint kontrol
npm run lint

# Build
npm run build
```

### Test Suite
```bash
# Unit tests
npm test

# Coverage raporu
npm run test:coverage

# Watch mode
npm run test:watch
```

### Manuel Test Senaryolari

**1. Authentication Flow:**
- [ ] Kayit ol (valid data)
- [ ] Kayit ol (invalid email) -> hata
- [ ] Giris yap (valid credentials)
- [ ] Giris yap (wrong password) -> hata
- [ ] 5 basarisiz deneme -> rate limit
- [ ] Sifre sifirlama

**2. Card CRUD:**
- [ ] Kart olustur (valid data)
- [ ] Kart olustur (XSS payload) -> sanitized
- [ ] Kart guncelle
- [ ] Kart sil
- [ ] Favori toggle
- [ ] Tag ekle/cikar

**3. Offline Mode:**
- [ ] Offline'da kart olustur
- [ ] Online'a gec -> sync
- [ ] Encrypted storage kontrolu

**4. Security:**
- [ ] XSS payload test: `<script>alert(1)</script>`
- [ ] Deep link manipulation: `cardvault://card/../admin`
- [ ] Rate limit bypass attempt
- [ ] SQL injection: `'; DROP TABLE cards; --`

---

## Kritik Dosyalar Ozeti

| Dosya | Onemi | Dikkat Edilecekler |
|-------|-------|-------------------|
| `src/lib/supabaseClient.ts` | Kritik | API key yonetimi |
| `src/context/AuthContext.tsx` | Kritik | Session yonetimi, rate limiting |
| `src/services/cardService.ts` | Yuksek | Input validation, error handling |
| `src/services/offlineService.ts` | Yuksek | Encrypted sync queue |
| `src/utils/sanitizer.ts` | Kritik | XSS korumasi |
| `src/lib/rateLimiter.ts` | Yuksek | Brute-force korumasi |
| `src/lib/secureStorage.ts` | Kritik | Hassas veri sifreleme |
| `src/navigation/linking.ts` | Orta | Deep link validation |

---

## Sonuc

Bu plan tamamlandiginda:
- **SOLID Uyumluluk:** %95+
- **TypeScript Coverage:** %100
- **Test Coverage:** %80+
- **Guvenlik:** Enterprise-grade

Sorulariniz icin bana ulasin!
