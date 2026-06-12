import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

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

export default app;
