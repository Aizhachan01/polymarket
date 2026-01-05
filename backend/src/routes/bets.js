import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createBet } from '../controllers/betController.js';

const router = express.Router();

// Place a bet (requires auth)
router.post('/', authenticate, createBet);

export default router;




