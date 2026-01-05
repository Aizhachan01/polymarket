import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.TEST_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.TEST_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase test configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
}

// Test database client (uses same database as development for simplicity)
// In production, you might want to use a separate test database
export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);

