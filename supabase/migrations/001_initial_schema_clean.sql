-- CardVault Database Schema
-- Initial Migration (Clean Version)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
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
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  position VARCHAR(150) NOT NULL,
  name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(500),
  address TEXT,
  profile_image TEXT,
  logo_image TEXT,
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  x_url VARCHAR(500),
  youtube_url VARCHAR(500),
  qr_code_data TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#007AFF',
  icon VARCHAR(50) DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- COLLECTION_CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS collection_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_collection_card UNIQUE(collection_id, card_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_company_name ON cards(company_name);
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_email ON cards(email);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_is_favorite ON cards(is_favorite);
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON collection_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON collection_cards(card_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Cards trigger
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Collections trigger
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Cards Policies
DROP POLICY IF EXISTS "Users can view their own cards" ON cards;
CREATE POLICY "Users can view their own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cards" ON cards;
CREATE POLICY "Users can insert their own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cards" ON cards;
CREATE POLICY "Users can update their own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards" ON cards;
CREATE POLICY "Users can delete their own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- Collections Policies
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own collections" ON collections;
CREATE POLICY "Users can insert their own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- Collection_cards Policies
DROP POLICY IF EXISTS "Users can view collection_cards" ON collection_cards;
CREATE POLICY "Users can view collection_cards"
  ON collection_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_cards.collection_id
      AND collections.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert collection_cards" ON collection_cards;
CREATE POLICY "Users can insert collection_cards"
  ON collection_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_cards.collection_id
      AND collections.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM cards
      WHERE cards.id = collection_cards.card_id
      AND cards.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete collection_cards" ON collection_cards;
CREATE POLICY "Users can delete collection_cards"
  ON collection_cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_cards.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- =====================================================
-- AUTOMATIC PROFILE CREATION
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- HELPER FUNCTIONS (SECURITY INVOKER - RLS Safe)
-- =====================================================

-- Kullanıcının kendi koleksiyonlarını sayılarıyla birlikte getir
-- NOT: SECURITY INVOKER ile RLS politikalarına tabi olur
DROP FUNCTION IF EXISTS get_collection_with_count(UUID);
CREATE OR REPLACE FUNCTION get_collection_with_count()
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
  WHERE c.user_id = auth.uid()  -- RLS ile uyumlu, client parametresi yok
  GROUP BY c.id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- RPC fonksiyonuna sadece authenticated kullanıcılar erişebilir
GRANT EXECUTE ON FUNCTION get_collection_with_count() TO authenticated;
REVOKE EXECUTE ON FUNCTION get_collection_with_count() FROM public;

-- Kullanıcının kendi kartlarında arama yap (SECURITY INVOKER - RLS Safe)
-- NOT: user_id_param kaldırıldı, auth.uid() kullanılıyor
DROP FUNCTION IF EXISTS search_cards(UUID, TEXT);
CREATE OR REPLACE FUNCTION search_cards(search_query TEXT)
RETURNS SETOF cards AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM cards
  WHERE user_id = auth.uid()  -- RLS ile uyumlu, client parametresi yok
  AND (
    company_name ILIKE '%' || search_query || '%' OR
    name ILIKE '%' || search_query || '%' OR
    position ILIKE '%' || search_query || '%' OR
    email ILIKE '%' || search_query || '%' OR
    phone ILIKE '%' || search_query || '%'
  )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- RPC fonksiyonuna sadece authenticated kullanıcılar erişebilir
GRANT EXECUTE ON FUNCTION search_cards(TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION search_cards(TEXT) FROM public;
