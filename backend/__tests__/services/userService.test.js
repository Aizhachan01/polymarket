import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getUserById, getUserByEmail, createUser, addPointsToUser, updateUserBalance } from '../../src/services/userService.js';
import { createTestUser, cleanupTestData } from '../../tests/helpers/database.js';

describe('User Service', () => {
  let testUserId;

  beforeEach(async () => {
    await cleanupTestData();
    const testUser = await createTestUser();
    testUserId = testUser.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const user = await getUserById(testUserId);
      
      expect(user).toBeDefined();
      expect(user.id).toBe(testUserId);
      expect(user.email).toContain('test-');
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await expect(getUserById(fakeId)).rejects.toThrow('User not found');
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const testUser = await createTestUser({ email: 'test-email@test.com' });
      const user = await getUserByEmail('test-email@test.com');
      
      expect(user).toBeDefined();
      expect(user.email).toBe('test-email@test.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await getUserByEmail('nonexistent@test.com');
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: `test-create-${Date.now()}@test.com`,
        username: `testcreate-${Date.now()}`,
        points_balance: 500,
        role: 'user',
        password: 'test',
      };

      const user = await createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(parseFloat(user.points_balance)).toBe(500);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test-duplicate@test.com',
        username: `testdup-${Date.now()}`,
        points_balance: 0,
        role: 'user',
        password: 'test',
      };

      await createUser(userData);
      
      await expect(createUser(userData)).rejects.toThrow('already exists');
    });
  });

  describe('updateUserBalance', () => {
    it('should update user balance', async () => {
      const newBalance = 2000;
      const updatedUser = await updateUserBalance(testUserId, newBalance);
      
      expect(parseFloat(updatedUser.points_balance)).toBe(newBalance);
    });

    it('should throw error for negative balance', async () => {
      await expect(updateUserBalance(testUserId, -100)).rejects.toThrow('cannot be negative');
    });
  });

  describe('addPointsToUser', () => {
    it('should add points to user balance', async () => {
      const initialUser = await getUserById(testUserId);
      const initialBalance = parseFloat(initialUser.points_balance);
      
      const amount = 500;
      const updatedUser = await addPointsToUser(testUserId, amount);
      
      expect(parseFloat(updatedUser.points_balance)).toBe(initialBalance + amount);
    });

    it('should throw error for negative amount', async () => {
      await expect(addPointsToUser(testUserId, -100)).rejects.toThrow('must be positive');
    });

    it('should throw error for zero amount', async () => {
      await expect(addPointsToUser(testUserId, 0)).rejects.toThrow('must be positive');
    });
  });
});



