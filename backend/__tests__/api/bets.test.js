import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { createTestUser, createTestMarket, cleanupTestData } from '../../tests/helpers/database.js';

describe('Bets API', () => {
  let testUserId;
  let testMarketId;

  beforeAll(async () => {
    await cleanupTestData();
    
    const testUser = await createTestUser({ points_balance: 1000 });
    testUserId = testUser.id;
    
    const adminUser = await createTestUser({ role: 'admin' });
    const testMarket = await createTestMarket(adminUser.id);
    testMarketId = testMarket.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/bets', () => {
    it('should place a bet successfully', async () => {
      const response = await request(app)
        .post('/api/bets')
        .set('x-user-id', testUserId)
        .send({
          market_id: testMarketId,
          side: 'YES',
          amount: 100,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_id).toBe(testUserId);
      expect(response.body.data.market_id).toBe(testMarketId);
      expect(response.body.data.side).toBe('YES');
      expect(parseFloat(response.body.data.amount)).toBe(100);
    });

    it('should reject bet without authentication', async () => {
      const response = await request(app)
        .post('/api/bets')
        .send({
          market_id: testMarketId,
          side: 'YES',
          amount: 100,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject bet with insufficient balance', async () => {
      const response = await request(app)
        .post('/api/bets')
        .set('x-user-id', testUserId)
        .send({
          market_id: testMarketId,
          side: 'NO',
          amount: 5000,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient');
    });

    it('should reject bet with invalid side', async () => {
      const response = await request(app)
        .post('/api/bets')
        .set('x-user-id', testUserId)
        .send({
          market_id: testMarketId,
          side: 'MAYBE',
          amount: 100,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject bet with missing fields', async () => {
      const response = await request(app)
        .post('/api/bets')
        .set('x-user-id', testUserId)
        .send({
          market_id: testMarketId,
          side: 'YES',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

