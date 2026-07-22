/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  shortenUrl,
  getShortLinkInfo,
} from "../controllers/urlShortener.controller.js";

const router = Router();

/** 30 shorten requests per hour per IP */
const shortenLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,
  max:            30,
  message:        { success: false, message: "Too many URLs shortened. Try again in an hour." },
  standardHeaders: true,
  legacyHeaders:   false,
});

/** 120 info lookups per minute per IP */
const infoLimiter = rateLimit({
  windowMs:       60 * 1000,
  max:            120,
  message:        { success: false, message: "Too many requests." },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.post("/",              shortenLimiter, shortenUrl);
router.get("/:code/info",     infoLimiter,    getShortLinkInfo);

export default router;
