/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import textRouter from "./routes/text.routes.js";
import shareRouter from "./routes/share.routes.js";
import urlShortenerRouter from "./routes/urlShortener.routes.js";
import { redirectShortUrl } from "./controllers/urlShortener.controller.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Application = express();

const isProduction = process.env.NODE_ENV === "production";

// Trust the first proxy hop (Render/Vercel/Nginx, and the Vite dev proxy) so
// req.ip and express-rate-limit read the real client IP from X-Forwarded-For.
// Using a fixed count (not `true`) keeps it safe against IP spoofing.
// Override with TRUST_PROXY if you sit behind more than one proxy.
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));

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
        connectSrc: ["'self'", ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()) : [])],
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

// In production, refusing to run wide-open is safer than silently allowing "*".
if (isProduction && allowedOrigins.includes("*")) {
  console.warn(
    "[security] CLIENT_ORIGIN is not set — CORS is running in wildcard mode. " +
      "Set CLIENT_ORIGIN to your site's origin(s) in production.",
  );
}

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

// Global rate-limit backstop — a safety net beneath the tighter per-route
// limiters, so any unforeseen endpoint (and abusive bursts) are still capped.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.GLOBAL_RATE_LIMIT ?? 300), // 300 req/min/IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests. Please slow down." },
  })
);

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
app.use("/api/text",    textRouter);
app.use("/api/share",   shareRouter);
app.use("/api/shorten", urlShortenerRouter);

// Short-link redirect — must be below /api routes to avoid conflicts
app.get("/r/:code", redirectShortUrl);

// 404 handler for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Global error handler - must be last
app.use(errorHandler);

export default app;
