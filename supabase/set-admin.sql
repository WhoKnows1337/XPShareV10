-- Set strangerr@me.com as admin
-- Run this in Supabase SQL Editor

-- Find user ID by email and set as admin
UPDATE user_profiles
SET is_admin = true
WHERE id IN (
  SELECT id
  FROM auth.users
  WHERE email = 'strangerr@me.com'
);

-- Verify the change
SELECT
  u.email,
  p.username,
  p.is_admin,
  p.created_at
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'strangerr@me.com';
