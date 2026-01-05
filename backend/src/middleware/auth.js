import { getUserById } from "../services/userService.js";
import { AppError } from "../utils/errors.js";

/**
 * Simple authentication middleware
 * In a real app, you'd verify JWT tokens or sessions
 * For now, expects userId in request header: x-user-id
 */
export async function authenticate(req, res, next) {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      throw new AppError(
        "Authentication required. Please provide x-user-id header",
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
