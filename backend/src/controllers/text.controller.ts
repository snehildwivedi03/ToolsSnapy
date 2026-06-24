import type { Request, Response, NextFunction } from "express";
import { CASE_TYPES, type CaseType } from "../types/text.types.js";
import { countText } from "../services/text/wordCounter.service.js";
import { countChars } from "../services/text/characterCounter.service.js";
import { convertCase } from "../services/text/caseConverter.service.js";
import { formatJson } from "../services/text/jsonFormatter.service.js";
import {
  analyzeJson,
  repairJson,
} from "../services/text/jsonValidator.service.js";
import { generateParagraphs } from "../services/text/randomParagraph.service.js";

// Validate that req.body.text is a non-empty string
function requireText(
  req: Request,
  res: Response,
): string | null {
  const { text } = req.body as { text?: unknown };
  if (typeof text !== "string") {
    res
      .status(400)
      .json({ success: false, error: "text must be a string" });
    return null;
  }
  return text;
}

export const wordCounter = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const text = requireText(req, res);
    if (text === null) return;
    res.json({ success: true, data: countText(text) });
  } catch (err) {
    next(err);
  }
};

export const characterCounter = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const text = requireText(req, res);
    if (text === null) return;
    res.json({ success: true, data: countChars(text) });
  } catch (err) {
    next(err);
  }
};

export const caseConverter = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const text = requireText(req, res);
    if (text === null) return;

    const { caseType } = req.body as { caseType?: unknown };
    if (
      typeof caseType !== "string" ||
      !(CASE_TYPES as readonly string[]).includes(caseType)
    ) {
      res.status(400).json({
        success: false,
        error: `caseType must be one of: ${CASE_TYPES.join(", ")}`,
      });
      return;
    }

    res.json({
      success: true,
      data: convertCase(text, caseType as CaseType),
    });
  } catch (err) {
    next(err);
  }
};

export const jsonFormatter = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const text = requireText(req, res);
    if (text === null) return;

    const { indent } = req.body as { indent?: unknown };
    const spaces =
      indent === 4 ? 4 : 2; // default to 2 spaces

    try {
      res.json({
        success: true,
        data: formatJson(text, spaces),
      });
    } catch {
      res
        .status(400)
        .json({ success: false, error: "Invalid JSON: cannot format" });
    }
  } catch (err) {
    next(err);
  }
};

export const jsonValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const text = requireText(req, res);
    if (text === null) return;
    res.json({ success: true, data: analyzeJson(text) });
  } catch (err) {
    next(err);
  }
};

export const jsonRepair = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const text = requireText(req, res);
    if (text === null) return;
    res.json({ success: true, data: repairJson(text) });
  } catch (err) {
    next(err);
  }
};

export const randomParagraph = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { count } = req.body as { count?: unknown };
    const n =
      typeof count === "number" && count >= 1 && count <= 20
        ? Math.floor(count)
        : 3;
    res.json({ success: true, data: generateParagraphs(n) });
  } catch (err) {
    next(err);
  }
};
