import { placeBet } from "../services/betService.js";

export async function createBet(req, res, next) {
  try {
    const { market_id, side, amount } = req.body;
    const userId = req.user.id;

    if (!market_id || !side || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: market_id, side, amount",
      });
    }

    const bet = await placeBet(userId, market_id, side, amount);

    res.status(201).json({
      success: true,
      data: bet,
    });
  } catch (error) {
    next(error);
  }
}
