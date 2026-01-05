import { signUp, signIn } from "../services/authService.js";

export async function signUpHandler(req, res, next) {
  try {
    const { email, username, password } = req.body;

    const result = await signUp(email, username, password);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function signInHandler(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await signIn(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

