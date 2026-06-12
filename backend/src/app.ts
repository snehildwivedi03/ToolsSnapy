import express from "express";
import type { Application, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import textRouter from "./routes/text.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Application = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — confirms the API is reachable
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "ToolSnapy API is running",
  });
});

// Feature routes
app.use("/api/text", textRouter);

// Global error handler — must be last
app.use(errorHandler);

export default app;
