import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getCurrentUser,
  getUserProfile,
  getUserBetsHandler
} from '../controllers/userController.js';

const router = express.Router();

// Get current user (requires auth)
router.get('/me', authenticate, getCurrentUser);

// Get user profile
router.get('/:userId', getUserProfile);

// Get user bets
router.get('/:userId/bets', getUserBetsHandler);

export default router;


