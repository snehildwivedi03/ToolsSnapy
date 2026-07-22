/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { shareUpload } from "../middleware/upload.middleware.js";
import {
  shareText,
  shareFiles,
  shareImages,
  sharePdfs,
  receiveShare,
  downloadZip,
  downloadFile,
  deleteShare,
  shareStats,
} from "../controllers/share.controller.js";

const router = Router();

// Rate limiters
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: "Too many uploads. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const receiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: "Too many requests. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload routes
router.post("/text",   uploadLimiter, shareText);
router.post("/files",  uploadLimiter, shareUpload.array("files"), shareFiles);
router.post("/images", uploadLimiter, shareUpload.array("files"), shareImages);
router.post("/pdfs",   uploadLimiter, shareUpload.array("files"), sharePdfs);

// Receive routes
router.get("/stats",                  receiveLimiter, shareStats);
router.get("/:code",                  receiveLimiter, receiveShare);
router.get("/:code/download/zip",     receiveLimiter, downloadZip);
router.get("/:code/download/file",    receiveLimiter, downloadFile);
router.delete("/:code",               receiveLimiter, deleteShare);

export default router;
