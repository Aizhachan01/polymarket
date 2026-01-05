import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { placeBet, getUserBets, getMarketBets, getMarketPools } from '../../src/services/betService.js';
import { createTestUser, createTestMarket, cleanupTestData } from '../../tests/helpers/database.js';

describe('Bet Service', () => {
  let testUserId;
  let testMarketId;
  let testUserId2;

  beforeEach(async () => {
    await cleanupTestData();
    const testUser = await createTestUser({ points_balance: 1000 });
    testUserId = testUser.id;
    
    const testUser2 = await createTestUser({ points_balance: 500 });
    testUserId2 = testUser2.id;
    
    const testMarket = await createTestMarket(testUserId);
    testMarketId = testMarket.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('placeBet', () => {
    it('should place a bet successfully', async () => {
      const bet = await placeBet(testUserId, testMarketId, 'YES', 100);
      
      expect(bet).toBeDefined();
      expect(bet.user_id).toBe(testUserId);
      expect(bet.market_id).toBe(testMarketId);
      expect(bet.side).toBe('YES');
      expect(parseFloat(bet.amount)).toBe(100);
    });

    it('should throw error for invalid side', async () => {
      await expect(placeBet(testUserId, testMarketId, 'MAYBE', 100)).rejects.toThrow('must be YES or NO');
    });

    it('should throw error for negative amount', async () => {
      await expect(placeBet(testUserId, testMarketId, 'YES', -100)).rejects.toThrow('must be positive');
    });

    it('should throw error for insufficient balance', async () => {
      await expect(placeBet(testUserId, testMarketId, 'YES', 2000)).rejects.toThrow('Insufficient balance');
    });

    it('should update existing bet when betting on same side', async () => {
      const bet1 = await placeBet(testUserId, testMarketId, 'YES', 100);
      const bet2 = await placeBet(testUserId, testMarketId, 'YES', 50);
      
      expect(bet2.id).toBe(bet1.id);
      expect(parseFloat(bet2.amount)).toBe(150);
    });
  });

  describe('getUserBets', () => {
    it('should get all bets for a user', async () => {
      await placeBet(testUserId, testMarketId, 'YES', 100);
      await placeBet(testUserId2, testMarketId, 'NO', 50);
      
      const bets = await getUserBets(testUserId);
      
      expect(Array.isArray(bets)).toBe(true);
      expect(bets.length).toBeGreaterThan(0);
      bets.forEach(bet => {
        expect(bet.user_id).toBe(testUserId);
      });
    });

    it('should filter bets by market_id', async () => {
      const market2 = await createTestMarket(testUserId);
      await placeBet(testUserId, testMarketId, 'YES', 100);
      await placeBet(testUserId, market2.id, 'NO', 50);
      
      const bets = await getUserBets(testUserId, { market_id: testMarketId });
      
      expect(bets.length).toBe(1);
      expect(bets[0].market_id).toBe(testMarketId);
    });
  });

  describe('getMarketBets', () => {
    it('should get all bets for a market', async () => {
      await placeBet(testUserId, testMarketId, 'YES', 100);
      await placeBet(testUserId2, testMarketId, 'NO', 50);
      
      const bets = await getMarketBets(testMarketId);
      
      expect(Array.isArray(bets)).toBe(true);
      expect(bets.length).toBe(2);
      bets.forEach(bet => {
        expect(bet.market_id).toBe(testMarketId);
      });
    });
  });

  describe('getMarketPools', () => {
    it('should calculate market pools correctly', async () => {
      await placeBet(testUserId, testMarketId, 'YES', 100);
      await placeBet(testUserId2, testMarketId, 'YES', 50);
      await placeBet(testUserId, testMarketId, 'NO', 75);
      
      const pools = await getMarketPools(testMarketId);
      
      expect(pools.yes).toBe(150);
      expect(pools.no).toBe(75);
      expect(pools.total).toBe(225);
    });

    it('should return zero pools for market with no bets', async () => {
      const pools = await getMarketPools(testMarketId);
      
      expect(pools.yes).toBe(0);
      expect(pools.no).toBe(0);
      expect(pools.total).toBe(0);
    });
  });
});

