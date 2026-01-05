import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials for testing');
}

export const testSupabase = createClient(supabaseUrl, supabaseKey);

/**
 * Clean up test data - improved version that actually works
 */
export async function cleanupTestData() {
  try {
    // Step 1: Get all test users (using ilike for case-insensitive matching)
    const { data: testUsers, error: usersError } = await testSupabase
      .from('users')
      .select('id')
      .or('email.ilike.test-%,username.ilike.testuser-%,username.ilike.test-%');
    
    if (usersError) {
      console.error('Error fetching test users:', usersError);
      return;
    }

    if (testUsers && testUsers.length > 0) {
      const testUserIds = testUsers.map(u => u.id);
      
      // Step 2: Delete all bets for test users
      const { error: betsError } = await testSupabase
        .from('bets')
        .delete()
        .in('user_id', testUserIds);
      
      if (betsError) {
        console.error('Error deleting test bets:', betsError);
      }

      // Step 3: Delete markets created by test users
      const { error: marketsError } = await testSupabase
        .from('markets')
        .delete()
        .in('created_by', testUserIds);
      
      if (marketsError) {
        console.error('Error deleting test markets by user:', marketsError);
      }

      // Step 4: Delete test users
      const { error: deleteUsersError } = await testSupabase
        .from('users')
        .delete()
        .in('id', testUserIds);
      
      if (deleteUsersError) {
        console.error('Error deleting test users:', deleteUsersError);
      }
    }

    // Step 5: Delete any markets with test titles (catch-all)
    const testTitles = ['Test Market%', 'Admin Created Market%', 'Market to Resolve%'];
    for (const pattern of testTitles) {
      const { error } = await testSupabase
        .from('markets')
        .delete()
        .ilike('title', pattern);
      
      if (error) {
        console.error(`Error deleting markets with pattern ${pattern}:`, error);
      }
    }

  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * Create a test user with unique identifier
 */
export async function createTestUser(userData = {}) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  const { data, error } = await testSupabase
    .from('users')
    .insert([
      {
        email: `test-${timestamp}-${random}@test.com`,
        username: `testuser-${timestamp}-${random}`,
        points_balance: 1000,
        role: 'user',
        password: 'test',
        ...userData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a test market
 */
export async function createTestMarket(createdBy, marketData = {}) {
  const timestamp = Date.now();
  
  const { data, error } = await testSupabase
    .from('markets')
    .insert([
      {
        title: `Test Market ${timestamp}`,
        description: 'Test market description',
        status: 'open',
        created_by: createdBy,
        ...marketData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Force cleanup all test data using SQL - more reliable
 */
export async function forceCleanupAllTestData() {
  console.log('Starting force cleanup of all test data...');
  
  try {
    // Use raw SQL for more reliable cleanup
    const { error: betsError } = await testSupabase.rpc('exec_sql', {
      sql: `
        DELETE FROM bets 
        WHERE user_id IN (
          SELECT id FROM users 
          WHERE email LIKE 'test-%' 
             OR username LIKE 'testuser-%' 
             OR username LIKE 'test-%'
        );
      `
    });

    // Delete markets
    const { error: marketsError } = await testSupabase
      .from('markets')
      .delete()
      .or('title.ilike.Test Market%,title.ilike.Admin Created Market%,title.ilike.Market to Resolve%');
    
    // Delete users
    const { error: usersError } = await testSupabase
      .from('users')
      .delete()
      .or('email.ilike.test-%,username.ilike.testuser-%,username.ilike.test-%');
    
    console.log('Force cleanup completed!');
  } catch (error) {
    console.error('Force cleanup error:', error);
    throw error;
  }
}
