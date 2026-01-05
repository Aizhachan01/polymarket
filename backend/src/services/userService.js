import { supabase } from "../config/database.js";
import { AppError } from "../utils/errors.js";

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("User not found", 404);
    }
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}

/**
 * Create a new user
 */
export async function createUser(userData) {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new AppError(
        "User with this email or username already exists",
        409
      );
    }
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  return data;
}

/**
 * Update user points balance
 */
export async function updateUserBalance(userId, newBalance) {
  if (newBalance < 0) {
    throw new AppError("Balance cannot be negative", 400);
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      points_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  if (!data) {
    throw new AppError("User not found", 404);
  }

  return data;
}

/**
 * Add points to user balance
 */
export async function addPointsToUser(userId, amount) {
  if (amount <= 0) {
    throw new AppError("Amount must be positive", 400);
  }

  // Get current balance
  const user = await getUserById(userId);
  const newBalance = parseFloat(user.points_balance) + parseFloat(amount);

  return await updateUserBalance(userId, newBalance);
}

/**
 * Update user role
 */
export async function updateUserRole(userId, newRole) {
  if (!["user", "admin"].includes(newRole)) {
    throw new AppError("Role must be 'user' or 'admin'", 400);
  }

  // Check if user exists
  await getUserById(userId);

  const { data, error } = await supabase
    .from("users")
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new AppError(`Database error: ${error.message}`, 500);
  }

  if (!data) {
    throw new AppError("User not found", 404);
  }

  return data;
}
