-- Migration: 003_storage_policies.sql
-- Description: Storage bucket policies - RLS enforcement for avatars bucket
-- NOT: Bu migration storage.objects tablosu için RLS politikaları oluşturur

-- ==================== STORAGE RLS ENABLE ====================

-- Storage objects tablosunda RLS'yi etkinleştir
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ==================== AVATARS BUCKET POLICIES ====================

-- SELECT: Kullanıcı kendi avatarlarını okuyabilir
DROP POLICY IF EXISTS "Users can read their own avatars" ON storage.objects;
CREATE POLICY "Users can read their own avatars"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT: Kullanıcı kendi klasörüne yükleyebilir
DROP POLICY IF EXISTS "Users can upload to their own avatar folder" ON storage.objects;
CREATE POLICY "Users can upload to their own avatar folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Kullanıcı kendi avatarlarını güncelleyebilir
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Kullanıcı kendi avatarlarını silebilir
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==================== BUCKET SECURITY ====================

-- Avatars bucket'ını private yap (public URL erişimini kapat)
-- NOT: Bu bucket için signed URL kullanımı zorunlu olur
UPDATE storage.buckets
SET public = false
WHERE name = 'avatars';

-- ==================== COMMENTS ====================

COMMENT ON POLICY "Users can read their own avatars" ON storage.objects IS
  'Kullanıcı sadece kendi UID klasöründeki avatarları okuyabilir';

COMMENT ON POLICY "Users can upload to their own avatar folder" ON storage.objects IS
  'Kullanıcı sadece kendi UID klasörüne avatar yükleyebilir';

COMMENT ON POLICY "Users can update their own avatars" ON storage.objects IS
  'Kullanıcı sadece kendi UID klasöründeki avatarları güncelleyebilir';

COMMENT ON POLICY "Users can delete their own avatars" ON storage.objects IS
  'Kullanıcı sadece kendi UID klasöründeki avatarları silebilir';
