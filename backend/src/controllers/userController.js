import { getUserById, addPointsToUser } from "../services/userService.js";
import { getUserBets } from "../services/betService.js";
import { supabase } from "../config/database.js";

export async function getCurrentUser(req, res, next) {
  try {
    const user = req.user;
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserProfile(req, res, next) {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const user = await getUserById(userId);

    // Get user bets with market details
    let bets = [];
    try {
      bets = await getUserBets(userId) || [];
    } catch (betError) {
      // If there's an error getting bets, log it but continue with empty array
      console.error("Error fetching bets:", betError.message);
      bets = [];
    }

    // Calculate statistics
    const totalBets = bets.length;
    const totalWagered = bets.reduce((sum, bet) => {
      return sum + parseFloat(bet.amount || 0);
    }, 0);
    
    const resolvedBets = bets.filter(bet => {
      return bet.market && bet.market.status === "resolved";
    });
    
    const wonBets = resolvedBets.filter(
      bet => bet.market && bet.market.resolution === bet.side
    ).length;
    
    const lostBets = resolvedBets.filter(
      bet => bet.market && bet.market.resolution && bet.market.resolution !== bet.side
    ).length;

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        ...userWithoutPassword,
        stats: {
          totalBets,
          totalWagered: parseFloat(totalWagered.toFixed(2)),
          resolvedBets: resolvedBets.length,
          wonBets,
          lostBets,
          pendingBets: totalBets - resolvedBets.length,
        },
        bets: bets.slice(0, 50), // Limit to recent 50 bets
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserBetsHandler(req, res, next) {
  try {
    const userId = req.params.userId || req.user?.id;
    const bets = await getUserBets(userId, req.query);

    res.json({
      success: true,
      data: bets,
    });
  } catch (error) {
    next(error);
  }
}
