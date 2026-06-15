import { randomBytes } from "crypto";

// Unambiguous chars: no 0/O, no 1/I/L
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShareCode(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) {
    code += CHARS[byte! % CHARS.length];
  }
  return code;
}
