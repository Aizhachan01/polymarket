// Test setup and teardown
import { testSupabase } from '../config/testDatabase.js';

// Cleanup function to reset test data if needed
export async function cleanupTestData() {
  // Optional: Add cleanup logic here
  // For now, we'll use the same database, so no cleanup needed
  // In production tests, you might want to clean up test data
}

// Setup before all tests
beforeAll(async () => {
  // Test database connection
  const { data, error } = await testSupabase.from('users').select('count').limit(1);
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Test database connection failed: ${error.message}`);
  }
});

// Cleanup after all tests
afterAll(async () => {
  await cleanupTestData();
});

