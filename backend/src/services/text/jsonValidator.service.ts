import type { JsonValidatorResult } from "../../types/text.types.js";

export function validateJson(text: string): JsonValidatorResult {
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (err) {
    const message =
      err instanceof SyntaxError ? err.message : "Invalid JSON";
    return { valid: false, error: message };
  }
}
