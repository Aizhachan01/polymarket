-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are publicly viewable" ON users;
DROP POLICY IF EXISTS "Anyone can create user account" ON users;
DROP POLICY IF EXISTS "Users can update profiles" ON users;
DROP POLICY IF EXISTS "Markets are publicly viewable" ON markets;
DROP POLICY IF EXISTS "Allow market creation" ON markets;
DROP POLICY IF EXISTS "Allow market updates" ON markets;
DROP POLICY IF EXISTS "Bets are publicly viewable" ON bets;
DROP POLICY IF EXISTS "Allow bet creation" ON bets;

-- Users table policies
-- Everyone can read user profiles (public information)
CREATE POLICY "Users are publicly viewable"
  ON users FOR SELECT
  USING (true);

-- Users can insert new accounts (for registration)
CREATE POLICY "Anyone can create user account"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can update their own profile (checked in app layer)
-- Admins can update any profile (checked in app layer)
CREATE POLICY "Users can update profiles"
  ON users FOR UPDATE
  USING (true);

-- Markets table policies
-- Everyone can read markets (public information)
CREATE POLICY "Markets are publicly viewable"
  ON markets FOR SELECT
  USING (true);

-- Allow market creation (admin check done in application layer)
CREATE POLICY "Allow market creation"
  ON markets FOR INSERT
  WITH CHECK (true);

-- Allow market updates (admin check done in application layer)
CREATE POLICY "Allow market updates"
  ON markets FOR UPDATE
  USING (true);

-- Bets table policies
-- Everyone can read bets (public information)
CREATE POLICY "Bets are publicly viewable"
  ON bets FOR SELECT
  USING (true);

-- Allow bet creation (user ownership checked in application layer)
CREATE POLICY "Allow bet creation"
  ON bets FOR INSERT
  WITH CHECK (true);

-- Allow bet updates (user ownership checked in application layer)
CREATE POLICY "Allow bet updates"
  ON bets FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Note: Since we're using header-based authentication (x-user-id) and JWT tokens
-- instead of Supabase Auth JWT tokens, RLS policies using auth.uid() won't work.
-- These policies provide a basic security layer, but authorization (who can do what)
-- is primarily handled in the application layer through middleware.
-- 
-- For production with proper RLS, consider migrating to Supabase Auth with JWT tokens,
-- which would allow policies like: USING (auth.uid()::text = user_id::text)

