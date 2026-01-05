import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAllTestData() {
  console.log('🧹 Starting cleanup of all test data...\n');
  
  try {
    // Get test users count
    const { data: testUsers } = await supabase
      .from('users')
      .select('id')
      .or('email.ilike.test-%,username.ilike.testuser-%,username.ilike.test-%');
    
    const testUserIds = testUsers?.map(u => u.id) || [];
    console.log(`Found ${testUserIds.length} test users to delete`);

    if (testUserIds.length > 0) {
      // Delete bets
      const { error: betsError, count: betsCount } = await supabase
        .from('bets')
        .delete({ count: 'exact' })
        .in('user_id', testUserIds);
      
      if (betsError) {
        console.error('Error deleting bets:', betsError);
      } else {
        console.log(`✅ Deleted ${betsCount || 0} test bets`);
      }

      // Delete markets created by test users
      const { error: marketsError, count: marketsCount } = await supabase
        .from('markets')
        .delete({ count: 'exact' })
        .in('created_by', testUserIds);
      
      if (marketsError) {
        console.error('Error deleting markets:', marketsError);
      } else {
        console.log(`✅ Deleted ${marketsCount || 0} test markets (by user)`);
      }

      // Delete test users
      const { error: usersError, count: usersCount } = await supabase
        .from('users')
        .delete({ count: 'exact' })
        .in('id', testUserIds);
      
      if (usersError) {
        console.error('Error deleting users:', usersError);
      } else {
        console.log(`✅ Deleted ${usersCount || 0} test users`);
      }
    }

    // Delete any remaining test markets by title
    const { error: remainingMarketsError, count: remainingMarketsCount } = await supabase
      .from('markets')
      .delete({ count: 'exact' })
      .or('title.ilike.Test Market%,title.ilike.Admin Created Market%,title.ilike.Market to Resolve%');
    
    if (remainingMarketsError) {
      console.error('Error deleting remaining markets:', remainingMarketsError);
    } else if (remainingMarketsCount > 0) {
      console.log(`✅ Deleted ${remainingMarketsCount} additional test markets (by title)`);
    }

    console.log('\n✨ Cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanupAllTestData();
