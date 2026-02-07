import {
  Card,
  CreateCardInput,
  UpdateCardInput,
  GetCardsOptions,
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  GetCollectionsOptions,
} from './models';
import { ServiceResponse, AuthResponse, ValidationResult, CardStats, CollectionStats } from './api';

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
