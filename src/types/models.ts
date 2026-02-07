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
  is_favorite?: boolean;
  notes?: string;
  tags?: string[];
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
