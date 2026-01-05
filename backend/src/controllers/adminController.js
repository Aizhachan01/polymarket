import { createMarket } from "../services/marketService.js";
import { addPointsToUser, getUserById, updateUserRole } from "../services/userService.js";
import { resolveMarketAndDistribute } from "../services/resolutionService.js";

export async function createMarketHandler(req, res, next) {
  try {
    const { title, description } = req.body;
    const adminId = req.user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Title is required",
      });
    }

    const market = await createMarket({
      title,
      description: description || null,
      created_by: adminId,
    });

    res.status(201).json({
      success: true,
      data: market,
    });
  } catch (error) {
    next(error);
  }
}

export async function addPointsHandler(req, res, next) {
  try {
    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({
        success: false,
        error: "user_id and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be positive",
      });
    }

    const user = await addPointsToUser(user_id, amount);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveMarketHandler(req, res, next) {
  try {
    const marketId = req.params.id;
    const { resolution } = req.body;

    if (!resolution) {
      return res.status(400).json({
        success: false,
        error: "resolution is required (YES or NO)",
      });
    }

    const result = await resolveMarketAndDistribute(marketId, resolution);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function makeAdminHandler(req, res, next) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "user_id is required",
      });
    }

    // Check if user exists
    const user = await getUserById(user_id);

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        error: "User is already an admin",
      });
    }

    const updatedUser = await updateUserRole(user_id, "admin");

    res.json({
      success: true,
      data: updatedUser,
      message: `User ${updatedUser.username} (${updatedUser.email}) is now an admin`,
    });
  } catch (error) {
    next(error);
  }
}
