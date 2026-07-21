import { randomBytes } from "crypto";

/* ── Config ────────────────────────────────────────────────── */
const EXPIRY_MS      = 24 * 60 * 60 * 1000; // 24 hours
const MAX_STORE_SIZE = 10_000;
const CHARS          = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/* ── Types ─────────────────────────────────────────────────── */
export interface ShortLink {
  code:        string;
  originalUrl: string;
  createdAt:   number;
  expiresAt:   number;
  clicks:      number;
}

/* ── In-memory store ────────────────────────────────────────── */
const store = new Map<string, ShortLink>();

/* ── Helpers ────────────────────────────────────────────────── */
function generateCode(): string {
  const bytes = randomBytes(6);
  return Array.from(bytes, (b) => CHARS[b! % CHARS.length]).join("");
}

/**
 * SSRF guard — rejects any URL whose host could reach internal infrastructure.
 * Only public http / https URLs are allowed.
 */
export function isUrlSafe(raw: string): boolean {
  let u: URL;
  try { u = new URL(raw); } catch { return false; }

  if (u.protocol !== "http:" && u.protocol !== "https:") return false;

  const host = u.hostname.toLowerCase();
  if (!host || host.length < 4) return false;

  // Blocked reserved / local hostnames and TLDs
  const blockedTLDs = /\.(local|internal|localhost|test|example|invalid|home|lan|corp|intranet)$/;
  if (blockedTLDs.test(host)) return false;
  if (host === "localhost") return false;

  // IPv6 literals
  if (host.startsWith("[")) return false;

  // Reject non-standard numeric host encodings that can smuggle a private IP
  // past the dotted-quad checks below, e.g. http://2130706433 (127.0.0.1),
  // http://0x7f.0.0.1 (hex) or http://0177.0.0.1 (octal).
  if (/^[0-9]+$/.test(host)) return false;                 // pure decimal (e.g. 2130706433)
  if (/^0x/i.test(host)) return false;                     // hex-encoded
  if (/(^|\.)0\d/.test(host)) return false;                // octal-encoded octet
  if (/^0x[0-9a-f.]+$/i.test(host)) return false;          // dotted-hex

  // Loopback
  if (/^127\./.test(host)) return false;
  if (host === "::1")       return false;

  // RFC-1918 private ranges
  if (/^10\./.test(host))                          return false;
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) return false;
  if (/^192\.168\./.test(host))                    return false;

  // Link-local / APIPA
  if (/^169\.254\./.test(host)) return false;

  // Unspecified
  if (host === "0.0.0.0" || /^0\./.test(host) || host === "::") return false;

  // Cloud metadata services (AWS, GCP, Azure)
  if (
    host === "169.254.169.254"      ||
    host === "metadata.google.internal" ||
    host === "metadata.internal"    ||
    host === "fd00:ec2::254"
  ) return false;

  return true;
}

function evictExpired(): void {
  const now = Date.now();
  for (const [code, link] of store) {
    if (link.expiresAt < now) store.delete(code);
  }
}

/* ── Public API ─────────────────────────────────────────────── */

/** Creates (or returns an existing live) short link for the given URL. */
export function createShortLink(originalUrl: string): ShortLink {
  if (store.size >= MAX_STORE_SIZE) evictExpired();

  // De-duplicate: return the existing live link if the URL was already shortened
  for (const link of store.values()) {
    if (link.originalUrl === originalUrl && link.expiresAt > Date.now()) {
      return link;
    }
  }

  // Generate a collision-free code
  let code: string;
  do { code = generateCode(); } while (store.has(code));

  const now  = Date.now();
  const link: ShortLink = {
    code,
    originalUrl,
    createdAt: now,
    expiresAt: now + EXPIRY_MS,
    clicks:    0,
  };

  store.set(code, link);
  return link;
}

/** Looks up a short link by code. Returns null if not found or expired. */
export function getShortLink(code: string): ShortLink | null {
  const link = store.get(code);
  if (!link)                     return null;
  if (link.expiresAt < Date.now()) { store.delete(code); return null; }
  return link;
}

/** Increments the click counter for the given code. */
export function incrementClicks(code: string): void {
  const link = store.get(code);
  if (link) link.clicks += 1;
}
