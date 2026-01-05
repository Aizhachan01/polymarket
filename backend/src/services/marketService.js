import { supabase } from "../config/database.js";
import { AppError } from "../utils/errors.js";

/**
 * Create a new market
 */
export async function createMarket(marketData) {
  const { data, error } = await supabase
    .from("markets")
    .insert([marketData])
    .select()
    .single();

  if (error) {
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}

/**
 * Get market by ID
 */
export async function getMarketById(marketId) {
  const { data, error } = await supabase
    .from("markets")
    .select(
      `
      *,
      creator:users!markets_created_by_fkey(id, username, email)
    `
    )
    .eq("id", marketId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Market not found", 404);
    }
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}

/**
 * Get all markets with optional filters
 */
export async function getMarkets(filters = {}) {
  let query = supabase
    .from("markets")
    .select(
      `
      *,
      creator:users!markets_created_by_fkey(id, username, email)
    `
    )
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}

/**
 * Resolve a market
 */
export async function resolveMarket(marketId, resolution) {
  if (!["YES", "NO"].includes(resolution)) {
    throw new AppError("Resolution must be YES or NO", 400);
  }

  // Check if market exists and is open
  const market = await getMarketById(marketId);

  if (market.status !== "open") {
    throw new AppError("Market is already resolved", 400);
  }

  const { data, error } = await supabase
    .from("markets")
    .update({
      status: "resolved",
      resolution: resolution,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", marketId)
    .select()
    .single();

  if (error) {
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}
