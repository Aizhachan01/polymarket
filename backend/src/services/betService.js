import { supabase } from "../config/database.js";
import { AppError } from "../utils/errors.js";
import { getUserById, updateUserBalance } from "./userService.js";
import { getMarketById } from "./marketService.js";

/**
 * Place a bet on a market
 */
export async function placeBet(userId, marketId, side, amount) {
  // Validate side
  if (!["YES", "NO"].includes(side)) {
    throw new AppError("Side must be YES or NO", 400);
  }

  // Validate amount
  if (amount <= 0) {
    throw new AppError("Bet amount must be positive", 400);
  }

  // Check user exists and has sufficient balance
  const user = await getUserById(userId);
  if (parseFloat(user.points_balance) < amount) {
    throw new AppError("Insufficient balance", 400);
  }

  // Check market exists and is open
  const market = await getMarketById(marketId);
  if (market.status !== "open") {
    throw new AppError("Market is not open for betting", 400);
  }

  // Check if user already has a bet on this side
  const { data: existingBets, error: checkError } = await supabase
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .eq("market_id", marketId)
    .eq("side", side)
    .limit(1);

  // If error and it's not "no rows found", throw error
  if (checkError && checkError.code !== "PGRST116") {
    throw new AppError(`Database error: ${checkError.message}`, 500);
  }

  const existingBet = existingBets && existingBets.length > 0 ? existingBets[0] : null;

  let betData;

  if (existingBet) {
    // Update existing bet (add to existing amount)
    const newAmount = parseFloat(existingBet.amount) + parseFloat(amount);

    const { data: updatedBets, error } = await supabase
      .from("bets")
      .update({ amount: newAmount })
      .eq("id", existingBet.id)
      .select()
      .limit(1);

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    if (!updatedBets || updatedBets.length === 0) {
      throw new AppError("Failed to update bet", 500);
    }

    betData = updatedBets[0];
  } else {
    // Create new bet
    const { data: newBets, error } = await supabase
      .from("bets")
      .insert([
        {
          user_id: userId,
          market_id: marketId,
          side: side,
          amount: amount,
        },
      ])
      .select()
      .limit(1);

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    if (!newBets || newBets.length === 0) {
      throw new AppError("Failed to create bet", 500);
    }

    betData = newBets[0];
  }

  // Deduct points from user balance
  const newBalance = parseFloat(user.points_balance) - parseFloat(amount);
  await updateUserBalance(userId, newBalance);

  return betData;
}

/**
 * Get bets for a user
 */
export async function getUserBets(userId, filters = {}) {
  // First get bets
  let query = supabase
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.market_id) {
    query = query.eq("market_id", filters.market_id);
  }

  const { data: bets, error: betsError } = await query;

  if (betsError) {
    // If no bets found, return empty array instead of error
    if (betsError.code === "PGRST116" || betsError.message.includes("No rows")) {
      return [];
    }
    throw new AppError(`Database error: ${betsError.message}`, 500);
  }

  if (!bets || bets.length === 0) {
    return [];
  }

  // Get unique market IDs
  const marketIds = [...new Set(bets.map(bet => bet.market_id))];

  // Get markets separately
  const { data: markets, error: marketsError } = await supabase
    .from("markets")
    .select("id, title, description, status, resolution, created_at, resolved_at")
    .in("id", marketIds);

  if (marketsError) {
    console.error("Error fetching markets:", marketsError.message);
    // Return bets without market details if markets query fails
    return bets.map(bet => ({ ...bet, market: null }));
  }

  // Create a map of markets by ID
  const marketMap = {};
  if (markets) {
    markets.forEach(market => {
      marketMap[market.id] = market;
    });
  }

  // Combine bets with market details
  const betsWithMarkets = bets.map(bet => ({
    ...bet,
    market: marketMap[bet.market_id] || null,
  }));

  return betsWithMarkets;
}

/**
 * Get all bets for a market
 */
export async function getMarketBets(marketId) {
  const { data, error } = await supabase
    .from("bets")
    .select(
      `
      *,
      user:users(id, username, email)
    `
    )
    .eq("market_id", marketId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}

/**
 * Get market pool totals (total amount bet on each side)
 */
export async function getMarketPools(marketId) {
  const { data: yesBets, error: yesError } = await supabase
    .from("bets")
    .select("amount, user_id")
    .eq("market_id", marketId)
    .eq("side", "YES");

  if (yesError) {
    throw new AppError(`Database error: ${yesError.message}`, 500);
  }

  const { data: noBets, error: noError } = await supabase
    .from("bets")
    .select("amount, user_id")
    .eq("market_id", marketId)
    .eq("side", "NO");

  if (noError) {
    throw new AppError(`Database error: ${noError.message}`, 500);
  }

  const yesPool = yesBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const noPool = noBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  
  // Get unique bettor counts
  const yesBettors = new Set(yesBets.map(bet => bet.user_id)).size;
  const noBettors = new Set(noBets.map(bet => bet.user_id)).size;
  const totalBettors = new Set([...yesBets.map(bet => bet.user_id), ...noBets.map(bet => bet.user_id)]).size;

  const total = yesPool + noPool;
  const yesPercentage = total > 0 ? (yesPool / total) * 100 : 0;
  const noPercentage = total > 0 ? (noPool / total) * 100 : 0;

  return {
    yes: yesPool,
    no: noPool,
    total: total,
    yesBettors,
    noBettors,
    totalBettors,
    yesPercentage: parseFloat(yesPercentage.toFixed(2)),
    noPercentage: parseFloat(noPercentage.toFixed(2)),
  };
}
