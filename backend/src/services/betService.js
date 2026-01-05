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
  const { data: existingBet } = await supabase
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .eq("market_id", marketId)
    .eq("side", side)
    .single();

  let betData;

  if (existingBet) {
    // Update existing bet (add to existing amount)
    const newAmount = parseFloat(existingBet.amount) + parseFloat(amount);

    const { data, error } = await supabase
      .from("bets")
      .update({ amount: newAmount })
      .eq("id", existingBet.id)
      .select()
      .single();

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }
    betData = data;
  } else {
    // Create new bet
    const { data, error } = await supabase
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
      .single();

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }
    betData = data;
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
  let query = supabase
    .from("bets")
    .select(
      `
      *,
      market:markets(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.market_id) {
    query = query.eq("market_id", filters.market_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
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
    .select("amount")
    .eq("market_id", marketId)
    .eq("side", "YES");

  if (yesError) {
    throw new AppError(`Database error: ${yesError.message}`, 500);
  }

  const { data: noBets, error: noError } = await supabase
    .from("bets")
    .select("amount")
    .eq("market_id", marketId)
    .eq("side", "NO");

  if (noError) {
    throw new AppError(`Database error: ${noError.message}`, 500);
  }

  const yesPool = yesBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const noPool = noBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

  return {
    yes: yesPool,
    no: noPool,
    total: yesPool + noPool,
  };
}
