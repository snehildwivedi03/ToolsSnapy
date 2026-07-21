import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

const isProduction = process.env.NODE_ENV === "production";

// Catches any unhandled error and returns a consistent JSON error shape.
// Never leaks internal error details (stack traces, file paths) to clients.
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Multer (upload) errors are client-side problems → 400 with a safe message.
  if (err instanceof MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "A file exceeds the maximum allowed size.",
      LIMIT_FILE_COUNT: "Too many files in one upload.",
      LIMIT_PART_COUNT: "Upload has too many parts.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
    };
    res.status(400).json({
      success: false,
      error: messages[err.code] ?? "Invalid upload.",
    });
    return;
  }

  // Log full detail server-side for debugging, but never return it.
  console.error("[error]", err);

  res.status(500).json({
    success: false,
    error: isProduction
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error",
  });
};
