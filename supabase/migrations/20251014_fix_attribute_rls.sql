-- Fix RLS policies for attribute_schema to use correct admin check
-- The system uses user_profiles.is_admin, not profiles.role

-- Drop old policy
DROP POLICY IF EXISTS "Admin write attribute schema" ON attribute_schema;

-- Create new policy with correct admin check
CREATE POLICY "Admin write attribute schema"
  ON attribute_schema FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fixed RLS policy for attribute_schema to use user_profiles.is_admin';
END $$;
