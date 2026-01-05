import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createMarket, getMarketById, getMarkets, resolveMarket } from '../../src/services/marketService.js';
import { createTestUser, createTestMarket, cleanupTestData } from '../../tests/helpers/database.js';

describe('Market Service', () => {
  let testUserId;
  let testMarketId;

  beforeEach(async () => {
    await cleanupTestData();
    const testUser = await createTestUser({ role: 'admin' });
    testUserId = testUser.id;
    
    const testMarket = await createTestMarket(testUserId);
    testMarketId = testMarket.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('createMarket', () => {
    it('should create a new market', async () => {
      const marketData = {
        title: 'Test Market Creation',
        description: 'Testing market creation',
        created_by: testUserId,
      };

      const market = await createMarket(marketData);
      
      expect(market).toBeDefined();
      expect(market.title).toBe(marketData.title);
      expect(market.status).toBe('open');
      expect(market.resolution).toBeNull();
    });
  });

  describe('getMarketById', () => {
    it('should get market by ID', async () => {
      const market = await getMarketById(testMarketId);
      
      expect(market).toBeDefined();
      expect(market.id).toBe(testMarketId);
      expect(market.title).toContain('Test Market');
    });

    it('should throw error for non-existent market', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await expect(getMarketById(fakeId)).rejects.toThrow('Market not found');
    });
  });

  describe('getMarkets', () => {
    it('should get all markets', async () => {
      const markets = await getMarkets();
      
      expect(Array.isArray(markets)).toBe(true);
      expect(markets.length).toBeGreaterThan(0);
    });

    it('should filter markets by status', async () => {
      const openMarkets = await getMarkets({ status: 'open' });
      
      expect(Array.isArray(openMarkets)).toBe(true);
      openMarkets.forEach(market => {
        expect(market.status).toBe('open');
      });
    });

    it('should filter markets by resolved status', async () => {
      // First resolve a market
      await resolveMarket(testMarketId, 'YES');
      
      const resolvedMarkets = await getMarkets({ status: 'resolved' });
      
      expect(Array.isArray(resolvedMarkets)).toBe(true);
      resolvedMarkets.forEach(market => {
        expect(market.status).toBe('resolved');
      });
    });
  });

  describe('resolveMarket', () => {
    it('should resolve market as YES', async () => {
      const resolvedMarket = await resolveMarket(testMarketId, 'YES');
      
      expect(resolvedMarket.status).toBe('resolved');
      expect(resolvedMarket.resolution).toBe('YES');
      expect(resolvedMarket.resolved_at).toBeDefined();
    });

    it('should resolve market as NO', async () => {
      const resolvedMarket = await resolveMarket(testMarketId, 'NO');
      
      expect(resolvedMarket.status).toBe('resolved');
      expect(resolvedMarket.resolution).toBe('NO');
    });

    it('should throw error for invalid resolution', async () => {
      await expect(resolveMarket(testMarketId, 'INVALID')).rejects.toThrow('must be YES or NO');
    });

    it('should throw error when resolving already resolved market', async () => {
      await resolveMarket(testMarketId, 'YES');
      
      await expect(resolveMarket(testMarketId, 'NO')).rejects.toThrow('already resolved');
    });
  });
});

