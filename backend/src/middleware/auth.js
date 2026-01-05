import { getUserById } from "../services/userService.js";
import { verifyToken } from "../services/authService.js";
import { AppError } from "../utils/errors.js";

/**
 * Authentication middleware
 * Supports both JWT token (Authorization header) and x-user-id header (for backward compatibility)
 */
export async function authenticate(req, res, next) {
  try {
    let userId = null;

    // Try JWT token first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      userId = verifyToken(token);
    } else {
      // Fallback to x-user-id header (for backward compatibility)
      userId = req.headers["x-user-id"];
    }

    if (!userId) {
      throw new AppError(
        "Authentication required. Please provide Authorization header (Bearer token) or x-user-id header",
        401
      );
    }

    // Verify user exists
    const user = await getUserById(userId);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
