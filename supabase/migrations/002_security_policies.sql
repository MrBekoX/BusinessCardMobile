-- Migration: 002_security_policies.sql
-- Description: Add missing RLS policies for improved security
-- This migration adds missing DELETE and UPDATE policies for better data protection

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES TABLE ====================

-- Missing: Users can delete their own profile
CREATE POLICY IF NOT EXISTS "Users can delete their own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ==================== COLLECTION_CARDS TABLE ====================

-- Missing: Users can update collection_cards for their own collections
CREATE POLICY IF NOT EXISTS "Users can update collection_cards for their collections"
  ON collection_cards
  FOR UPDATE
  USING (
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
  )
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

-- ==================== STORAGE POLICIES ====================

-- NOTE: Storage policies are implemented in migration 003_storage_policies.sql.
-- Aşağıdaki blok sadece referans amaçlı tutulmuştur.

/*
-- Avatars bucket policies (to be created in Supabase Dashboard):

-- Users can upload to their own folder
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Users can upload to their own avatar folder',
  (SELECT id FROM storage.buckets WHERE name = 'avatars'),
  'bucket_id = ''avatars'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'INSERT'
) ON CONFLICT (name) DO NOTHING;

-- Users can read their own avatars
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Users can read their own avatars',
  (SELECT id FROM storage.buckets WHERE name = 'avatars'),
  'bucket_id = ''avatars'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'SELECT'
) ON CONFLICT (name) DO NOTHING;

-- Users can delete their own avatars
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Users can delete their own avatars',
  (SELECT id FROM storage.buckets WHERE name = 'avatars'),
  'bucket_id = ''avatars'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'DELETE'
) ON CONFLICT (name) DO NOTHING;

-- Users can update their own avatars
INSERT INTO storage.policies (name, bucket_id, definition, operation)
VALUES (
  'Users can update their own avatars',
  (SELECT id FROM storage.buckets WHERE name = 'avatars'),
  'bucket_id = ''avatars'' AND (storage.foldername(name))[1] = auth.uid()::text',
  'UPDATE'
) ON CONFLICT (name) DO NOTHING;
*/

-- ==================== SECURITY HELPER FUNCTIONS ====================

-- Helper function to check if a user owns a specific card (F-008 Fix: parametre gölgelemesi düzeltildi)
CREATE OR REPLACE FUNCTION user_owns_card(p_card_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM cards
    WHERE id = p_card_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Helper function to check if a user owns a specific collection (F-008 Fix: parametre gölgelemesi düzeltildi)
CREATE OR REPLACE FUNCTION user_owns_collection(p_collection_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM collections
    WHERE id = p_collection_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Helper function to check if a card is in a user's collection (F-008 Fix: parametre gölgelemesi düzeltildi)
CREATE OR REPLACE FUNCTION card_is_in_users_collection(p_card_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM collection_cards cc
    JOIN collections c ON c.id = cc.collection_id
    WHERE cc.card_id = p_card_id AND c.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ==================== COMMENTS ====================

COMMENT ON POLICY "Users can delete their own profile" ON profiles IS
  'Allows users to delete their own profile account';

COMMENT ON POLICY "Users can update collection_cards for their collections" ON collection_cards IS
  'Allows users to update card positions within their own collections';

COMMENT ON FUNCTION user_owns_card(UUID, UUID) IS
  'Security helper to check card ownership';

COMMENT ON FUNCTION user_owns_collection(UUID, UUID) IS
  'Security helper to check collection ownership';

COMMENT ON FUNCTION card_is_in_users_collection(UUID, UUID) IS
  'Security helper to check if card belongs to user''s collection';
