import express from "express";
import {
  getAllMarkets,
  getMarket,
  getMarketBetsHandler,
} from "../controllers/marketController.js";

const router = express.Router();

// Get all markets
router.get("/", getAllMarkets);

// Get market by ID
router.get("/:id", getMarket);

// Get bets for a market
router.get("/:id/bets", getMarketBetsHandler);

export default router;
