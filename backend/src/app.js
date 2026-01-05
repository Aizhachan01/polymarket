import express from "express";
import cors from "cors";
import { errorHandler } from "./utils/errors.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import marketsRoutes from "./routes/markets.js";
import betsRoutes from "./routes/bets.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/markets", marketsRoutes);
app.use("/api/bets", betsRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
