import { getUserById, addPointsToUser } from "../services/userService.js";
import { getUserBets } from "../services/betService.js";

export async function getCurrentUser(req, res, next) {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserProfile(req, res, next) {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await getUserById(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserBetsHandler(req, res, next) {
  try {
    const userId = req.params.userId || req.user.id;
    const bets = await getUserBets(userId, req.query);

    res.json({
      success: true,
      data: bets,
    });
  } catch (error) {
    next(error);
  }
}
