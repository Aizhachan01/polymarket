import express from "express";
import { signUpHandler, signInHandler } from "../controllers/authController.js";

const router = express.Router();

// Public auth routes
router.post("/signup", signUpHandler);
router.post("/signin", signInHandler);

export default router;

