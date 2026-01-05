import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import {
  createMarketHandler,
  addPointsHandler,
  resolveMarketHandler
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Create a new market
router.post('/markets', createMarketHandler);

// Add points to a user
router.post('/users/add-points', addPointsHandler);

// Resolve a market and distribute winnings
router.post('/markets/:id/resolve', resolveMarketHandler);

export default router;

