-- =====================================================
-- Media Library Migration
-- Creates tables and storage for media management
-- =====================================================

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON media_library(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);

-- Add RLS policies
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view media
CREATE POLICY "Anyone can view media"
  ON media_library FOR SELECT
  USING (true);

-- Policy: Only admins can insert media
CREATE POLICY "Admins can insert media"
  ON media_library FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Only admins can update media
CREATE POLICY "Admins can update media"
  ON media_library FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Only admins can delete media
CREATE POLICY "Admins can delete media"
  ON media_library FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create storage bucket for media (if not exists)
-- Note: This needs to be done via Supabase Dashboard or supabase CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
-- ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Media library migration completed successfully';
  RAISE NOTICE 'Created: media_library table with RLS policies';
  RAISE NOTICE 'Note: Create "media" storage bucket in Supabase Dashboard if not exists';
END $$;
