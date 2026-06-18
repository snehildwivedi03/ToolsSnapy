import type { JsonValidatorResult } from "../../types/text.types.js";

export function validateJson(text: string): JsonValidatorResult {
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (err) {
    const message =
      err instanceof SyntaxError ? err.message : "Invalid JSON";

    // Modern Node (v20+): "... at line X column Y"
    const lineMatch = message.match(/\bat line (\d+)\b/i);
    const lineStr = lineMatch?.[1];
    if (lineStr) {
      return { valid: false, error: message, line: parseInt(lineStr, 10) };
    }

    // Older Node: "... at position X" - compute line from char offset
    const posMatch = message.match(/\bat position (\d+)\b/i);
    const posStr = posMatch?.[1];
    if (posStr) {
      const pos = parseInt(posStr, 10);
      const line = text.substring(0, pos).split("\n").length;
      return { valid: false, error: message, line };
    }

    return { valid: false, error: message };
  }
}
