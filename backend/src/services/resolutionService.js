import { supabase } from "../config/database.js";
import { AppError } from "../utils/errors.js";
import { resolveMarket } from "./marketService.js";
import { getMarketBets, getMarketPools } from "./betService.js";
import { updateUserBalance } from "./userService.js";

/**
 * Resolve a market and distribute winnings to winners
 *
 * Resolution logic:
 * - The losing pool (all bets on the losing side) is distributed proportionally
 *   to winners based on their bet amounts
 * - Each winner gets: (their_bet_amount / winning_pool_total) * losing_pool_total
 * - Winners also get back their original bet amount
 */
export async function resolveMarketAndDistribute(marketId, resolution) {
  if (!["YES", "NO"].includes(resolution)) {
    throw new AppError("Resolution must be YES or NO", 400);
  }

  // Resolve the market
  const market = await resolveMarket(marketId, resolution);

  // Get all bets for this market
  const allBets = await getMarketBets(marketId);

  // Get pool totals
  const pools = await getMarketPools(marketId);

  const winningSide = resolution;
  const losingSide = resolution === "YES" ? "NO" : "YES";
  const winningPool = pools[winningSide.toLowerCase()];
  const losingPool = pools[losingSide.toLowerCase()];

  // If no winners, return early (all bets stay with the house)
  if (winningPool === 0) {
    return {
      market,
      distributed: false,
      message: "No winners to distribute to",
    };
  }

  // If no losers, winners just get their bets back (nothing to distribute)
  if (losingPool === 0) {
    // Return original bets to winners
    const winningBets = allBets.filter((bet) => bet.side === winningSide);
    for (const bet of winningBets) {
      const currentBalance = await supabase
        .from("users")
        .select("points_balance")
        .eq("id", bet.user_id)
        .single();

      const newBalance =
        parseFloat(currentBalance.data.points_balance) + parseFloat(bet.amount);
      await updateUserBalance(bet.user_id, newBalance);
    }

    return {
      market,
      distributed: true,
      totalDistributed: 0,
      message: "Winners received their bets back (no losing pool)",
    };
  }

  // Calculate and distribute winnings proportionally
  const winningBets = allBets.filter((bet) => bet.side === winningSide);
  let totalDistributed = 0;

  for (const bet of winningBets) {
    const betAmount = parseFloat(bet.amount);

    // Calculate winnings: proportional share of losing pool + original bet
    const proportionalShare = (betAmount / winningPool) * losingPool;
    const totalWinnings = betAmount + proportionalShare;
    totalDistributed += proportionalShare;

    // Get current user balance
    const { data: userData } = await supabase
      .from("users")
      .select("points_balance")
      .eq("id", bet.user_id)
      .single();

    if (userData) {
      const newBalance = parseFloat(userData.points_balance) + totalWinnings;
      await updateUserBalance(bet.user_id, newBalance);
    }
  }

  return {
    market,
    distributed: true,
    winningPool,
    losingPool,
    totalDistributed,
    winnerCount: winningBets.length,
  };
}
