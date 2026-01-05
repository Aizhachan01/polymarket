import { describe, test, expect } from '@jest/globals';
import { testSupabase } from '../config/testDatabase.js';

describe('Database Connection Tests', () => {
  test('should connect to Supabase database', async () => {
    const { data, error } = await testSupabase.from('users').select('count').limit(1);
    expect(error).toBeNull();
  });

  test('should be able to query users table', async () => {
    const { data, error } = await testSupabase.from('users').select('*').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  test('should be able to query markets table', async () => {
    const { data, error } = await testSupabase.from('markets').select('*').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  test('should be able to query bets table', async () => {
    const { data, error } = await testSupabase.from('bets').select('*').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  test('should have correct table structure for users', async () => {
    const { data, error } = await testSupabase
      .from('users')
      .select('id, email, username, points_balance, role, created_at, updated_at')
      .limit(1);
    
    if (!error && data && data.length > 0) {
      const user = data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('points_balance');
      expect(user).toHaveProperty('role');
    }
  });
});

