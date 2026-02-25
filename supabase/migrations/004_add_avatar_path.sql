-- Migration: 004_add_avatar_path.sql
-- Description: Add avatar_path column to profiles table (F-006 Fix)
-- NOT: Object path saklama için yeni kolon, signed URL yerine kullanılacak

-- Add avatar_path column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_path TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_path ON profiles(avatar_path);

-- Comment explaining the column usage
COMMENT ON COLUMN profiles.avatar_path IS 
  'Storage object path (e.g., userId/filename.jpg). Signed URL ihtiyaç anında oluşturulur.';

-- Migrate existing data: Convert avatar_url (signed URL) to avatar_path if possible
-- NOTE: This is a best-effort migration for existing data
UPDATE profiles 
SET avatar_path = CASE 
  WHEN avatar_url IS NOT NULL AND avatar_url LIKE '%/sign/%' 
  THEN NULL  -- Cannot extract path from signed URL, will be populated on next upload
  ELSE NULL 
END
WHERE avatar_path IS NULL;
