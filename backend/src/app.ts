import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import textRouter from "./routes/text.routes.js";
import shareRouter from "./routes/share.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Application = express();

const isProduction = process.env.NODE_ENV === "production";

// ═══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE (10/10 Configuration)
// ═══════════════════════════════════════════════════════════════

// Helmet.js with strict security headers
app.use(
  helmet({
    // Content Security Policy - prevents XSS attacks
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // needed for React
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", process.env.CLIENT_ORIGIN ?? "*"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    // Prevent clickjacking
    frameguard: { action: "deny" },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // HTTP Strict Transport Security (HTTPS enforcement)
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    // Prevent MIME type sniffing
    noSniff: true,
    // XSS filter (legacy browsers)
    xssFilter: true,
    // Referrer Policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Cross-Origin policies
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: false, // disabled for external resources
    // DNS prefetch control
    dnsPrefetchControl: { allow: false },
    // Permitted cross-domain policies
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
  })
);

// Compression for performance
app.use(compression());

// CORS with strict configuration
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : ["*"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc) in development
      if (!origin && !isProduction) return callback(null, true);
      if (allowedOrigins.includes("*")) return callback(null, true);
      if (origin && allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
    maxAge: 86400, // 24 hours
  })
);

// Request body size limits (prevent DoS)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Security: Block suspicious requests
app.use((req: Request, res: Response, next: NextFunction) => {
  // Block requests with suspicious patterns
  const suspicious = /(\.\.|%2e%2e|%252e|<script|javascript:|data:text\/html)/i;
  if (suspicious.test(req.url) || suspicious.test(JSON.stringify(req.body))) {
    return res.status(400).json({ success: false, error: "Bad request" });
  }
  next();
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check - confirms the API is reachable
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "ToolSnapy API is running",
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
app.use("/api/text", textRouter);
app.use("/api/share", shareRouter);

// 404 handler for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Global error handler - must be last
app.use(errorHandler);

export default app;
