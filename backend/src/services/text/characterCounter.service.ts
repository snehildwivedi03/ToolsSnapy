/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import type { CharCountResult } from "../../types/text.types.js";

export function countChars(text: string): CharCountResult {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const letters = (text.match(/[a-zA-Z]/g) ?? []).length;
  const digits = (text.match(/[0-9]/g) ?? []).length;
  const whitespace = (text.match(/\s/g) ?? []).length;

  return {
    characters,
    charactersNoSpaces,
    letters,
    digits,
    whitespace,
  };
}
