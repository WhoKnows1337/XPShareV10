# Supabase Setup Notes

## Required Settings for Development

### 1. Email Confirmation (IMPORTANT!)

**Problem:** By default, Supabase requires email confirmation for new signups.

**Solution for Development:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email" section, find "Confirm email"
3. **Disable** "Confirm email" toggle
4. Save settings

**Why:** In development, we don't want to wait for email confirmation. For production, re-enable this!

### 2. RLS Policies for user_profiles

**Problem:** Users couldn't create their profile during signup due to RLS.

**Solution Applied (via Supabase MCP):**
```sql
-- Allow INSERT for both authenticated AND anon (during signup)
CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (auth.uid() = id);
```

**Why:** During signup, the user is still `anon` role, not `authenticated` yet.

### 3. Allowed Email Domains

**Problem:** Some email domains may be blocked by Supabase.

**Solution:**
- Use common email providers (Gmail, Outlook, etc.) for testing
- Or configure allowed domains in Supabase Dashboard → Authentication → Settings

---

## All RLS Policies

### user_profiles

```sql
-- Insert (signup)
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
TO authenticated, anon
WITH CHECK (auth.uid() = id);

-- Select (own profile)
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Select (public profiles)
CREATE POLICY "Public profiles are viewable by everyone"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Update (own profile)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## Database Access via MCP

**ALWAYS use Supabase MCP tools for database operations:**

- `mcp__supabase__execute_sql` - Run SQL queries
- `mcp__supabase__apply_migration` - Create migrations
- `mcp__supabase__list_tables` - List tables
- `mcp__supabase__generate_typescript_types` - Generate types

**Never manually edit in Supabase Console when MCP is available!**

---

## Automatic Profile Creation

**Solution: Database Trigger**

A database trigger automatically creates `user_profiles` when a user signs up:

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Why:** This prevents the race condition where `auth.users` is created but `user_profiles` insert fails due to RLS or other errors. The trigger runs with elevated privileges (SECURITY DEFINER) and always succeeds.

---

Last updated: 2025-10-06
