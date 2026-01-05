import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { createTestUser, createTestMarket, cleanupTestData } from '../../tests/helpers/database.js';

describe('Markets API', () => {
  let testUserId;
  let testMarketId;

  beforeAll(async () => {
    await cleanupTestData();
    const testUser = await createTestUser({ role: 'admin' });
    testUserId = testUser.id;
    
    const testMarket = await createTestMarket(testUserId);
    testMarketId = testMarket.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/markets', () => {
    it('should get all markets', async () => {
      const response = await request(app)
        .get('/api/markets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter markets by status', async () => {
      const response = await request(app)
        .get('/api/markets?status=open')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(market => {
        expect(market.status).toBe('open');
      });
    });
  });

  describe('GET /api/markets/:id', () => {
    it('should get market by ID', async () => {
      const response = await request(app)
        .get(`/api/markets/${testMarketId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testMarketId);
      expect(response.body.data.pools).toBeDefined();
    });

    it('should return 404 for non-existent market', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/markets/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/markets/:id/bets', () => {
    it('should get all bets for a market', async () => {
      const response = await request(app)
        .get(`/api/markets/${testMarketId}/bets`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

