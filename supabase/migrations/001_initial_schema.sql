-- CardVault Database Schema
-- Initial Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Kullanıcı profil bilgileri
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CARDS TABLE
-- Kartvizit bilgileri
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Temel bilgiler
  company_name VARCHAR(200) NOT NULL,
  position VARCHAR(150) NOT NULL,
  name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(500),
  address TEXT,

  -- Profil görseli
  profile_image TEXT,
  logo_image TEXT,

  -- Sosyal medya linkleri
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  x_url VARCHAR(500),
  youtube_url VARCHAR(500),

  -- QR kod
  qr_code_data TEXT,

  -- Metadata
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags TEXT[], -- Array of tags

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- İndeksler
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- COLLECTIONS TABLE
-- Koleksiyonlar
-- =====================================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#007AFF', -- Hex color code
  icon VARCHAR(50) DEFAULT 'folder',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- COLLECTION_CARDS TABLE
-- Koleksiyonlar ve kartlar arası many-to-many ilişki
-- =====================================================
CREATE TABLE IF NOT EXISTS collection_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,

  -- Sıralama için
  position INTEGER DEFAULT 0,

  -- Timestamps
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: Bir kart bir koleksiyonda sadece bir kez olabilir
  CONSTRAINT unique_collection_card UNIQUE(collection_id, card_id)
);

-- =====================================================
-- INDEXES
-- Performans için indeksler
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);

-- Cards indexes
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_company_name ON cards(company_name);
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_email ON cards(email);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_is_favorite ON cards(is_favorite);
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN(tags);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);

-- Collection_cards indexes
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON collection_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON collection_cards(card_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- Otomatik güncelleme için
-- =====================================================

-- Updated_at otomatik güncellemesi için fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Cards trigger
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Collections trigger
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Güvenlik politikaları
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Cards Policies
CREATE POLICY "Users can view their own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- Collections Policies
CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- Collection_cards Policies
CREATE POLICY "Users can view collection_cards for their collections"
  ON collection_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_cards.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert collection_cards for their collections"
  ON collection_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_cards.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete collection_cards for their collections"
  ON collection_cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_cards.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS FOR AUTOMATIC PROFILE CREATION
-- Kullanıcı kaydında otomatik profil oluşturma
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, display_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- HELPER FUNCTIONS
-- Yardımcı fonksiyonlar
-- =====================================================

-- Get collection with card count
CREATE OR REPLACE FUNCTION get_collection_with_count(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  color VARCHAR,
  icon VARCHAR,
  card_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.description,
    c.color,
    c.icon,
    COUNT(cc.card_id) AS card_count,
    c.created_at,
    c.updated_at
  FROM collections c
  LEFT JOIN collection_cards cc ON c.id = cc.collection_id
  WHERE c.user_id = user_id_param
  GROUP BY c.id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search cards
CREATE OR REPLACE FUNCTION search_cards(
  user_id_param UUID,
  search_query TEXT
)
RETURNS SETOF cards AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM cards
  WHERE user_id = user_id_param
  AND (
    company_name ILIKE '%' || search_query || '%' OR
    name ILIKE '%' || search_query || '%' OR
    position ILIKE '%' || search_query || '%' OR
    email ILIKE '%' || search_query || '%' OR
    phone ILIKE '%' || search_query || '%'
  )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
