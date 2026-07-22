/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import type { JsonFormatterResult } from "../../types/text.types.js";

export function formatJson(
  text: string,
  indent: number = 2,
): JsonFormatterResult {
  const parsed: unknown = JSON.parse(text); // throws if invalid
  const formattedJson = JSON.stringify(parsed, null, indent);
  return { formattedJson };
}
