import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { createTestUser, cleanupTestData } from '../../tests/helpers/database.js';
import { resolveMarket } from '../../src/services/marketService.js';

describe('Admin API', () => {
  let adminUserId;
  let regularUserId;
  let testMarketId;

  beforeAll(async () => {
    await cleanupTestData();
    
    const adminUser = await createTestUser({ role: 'admin' });
    adminUserId = adminUser.id;
    
    const regularUser = await createTestUser({ role: 'user' });
    regularUserId = regularUser.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/admin/markets', () => {
    it('should create a market as admin', async () => {
      const response = await request(app)
        .post('/api/admin/markets')
        .set('x-user-id', adminUserId)
        .send({
          title: 'Admin Created Market',
          description: 'Test market created by admin',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Admin Created Market');
      expect(response.body.data.status).toBe('open');
      
      testMarketId = response.body.data.id;
    });

    it('should reject market creation without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/markets')
        .send({
          title: 'Unauthorized Market',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject market creation by non-admin', async () => {
      const response = await request(app)
        .post('/api/admin/markets')
        .set('x-user-id', regularUserId)
        .send({
          title: 'Regular User Market',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should require title field', async () => {
      const response = await request(app)
        .post('/api/admin/markets')
        .set('x-user-id', adminUserId)
        .send({
          description: 'No title',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/markets/:id/resolve', () => {
    beforeEach(async () => {
      // Create a market for resolution tests
      const response = await request(app)
        .post('/api/admin/markets')
        .set('x-user-id', adminUserId)
        .send({
          title: 'Market to Resolve',
          description: 'Test resolution',
        });
      testMarketId = response.body.data.id;
    });

    it('should resolve market as YES', async () => {
      const response = await request(app)
        .post(`/api/admin/markets/${testMarketId}/resolve`)
        .set('x-user-id', adminUserId)
        .send({
          resolution: 'YES',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.market.status).toBe('resolved');
      expect(response.body.data.market.resolution).toBe('YES');
    });

    it('should reject resolution without authentication', async () => {
      const response = await request(app)
        .post(`/api/admin/markets/${testMarketId}/resolve`)
        .send({
          resolution: 'YES',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject resolution by non-admin', async () => {
      const response = await request(app)
        .post(`/api/admin/markets/${testMarketId}/resolve`)
        .set('x-user-id', regularUserId)
        .send({
          resolution: 'YES',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/users/add-points', () => {
    it('should add points to user', async () => {
      const response = await request(app)
        .post('/api/admin/users/add-points')
        .set('x-user-id', adminUserId)
        .send({
          user_id: regularUserId,
          amount: 500,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(parseFloat(response.body.data.points_balance)).toBeGreaterThanOrEqual(500);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/users/add-points')
        .send({
          user_id: regularUserId,
          amount: 500,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

