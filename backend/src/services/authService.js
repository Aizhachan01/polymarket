import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail } from "./userService.js";
import { AppError } from "../utils/errors.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Sign up a new user
 */
export async function signUp(email, username, password) {
  // Validate input
  if (!email || !username || !password) {
    throw new AppError("Email, username, and password are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const userData = {
    email,
    username,
    password: hashedPassword,
    points_balance: 0,
    role: "user",
  };

  const user = await createUser(userData);

  // Generate JWT token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Sign in an existing user
 */
export async function signIn(email, password) {
  // Validate input
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Get user by email
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if user has a password (for existing users without password)
  if (!user.password) {
    throw new AppError("Please set a password for your account", 400);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate JWT token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/**
 * Generate JWT token
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
}

