-- Disable Row Level Security on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE markets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users are publicly viewable" ON users;
DROP POLICY IF EXISTS "Anyone can create user account" ON users;
DROP POLICY IF EXISTS "Users can update profiles" ON users;
DROP POLICY IF EXISTS "Markets are publicly viewable" ON markets;
DROP POLICY IF EXISTS "Allow market creation" ON markets;
DROP POLICY IF EXISTS "Allow market updates" ON markets;
DROP POLICY IF EXISTS "Bets are publicly viewable" ON bets;
DROP POLICY IF EXISTS "Allow bet creation" ON bets;




