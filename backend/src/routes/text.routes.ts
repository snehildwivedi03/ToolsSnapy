/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as textCtrl from "../controllers/text.controller.js";

const router = Router();

// Rate limiter for text processing - 60 requests per minute
const textLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(textLimiter);

router.post("/word-counter", textCtrl.wordCounter);
router.post("/character-counter", textCtrl.characterCounter);
router.post("/case-converter", textCtrl.caseConverter);
router.post("/json-formatter", textCtrl.jsonFormatter);
router.post("/json-validator", textCtrl.jsonValidator);
router.post("/json-repair", textCtrl.jsonRepair);
router.post("/random-paragraph", textCtrl.randomParagraph);

export default router;
