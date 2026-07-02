import { fetchShareStats } from "./shareApi";

const STORAGE_KEY = "toolsnapy_share_stats";

export interface ShareStats {
  files: number;   // total file/image/PDF shares (real, server-side value)
  texts: number;   // total text shares (real, server-side value)
  kept: number;    // permanently stored — always 0 (everything expires)
}

// Fallback used only until the first successful fetch from the server.
const DEFAULTS: ShareStats = { files: 133, texts: 3299, kept: 0 };

export function getStats(): ShareStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ShareStats>;
    return {
      files: parsed.files ?? DEFAULTS.files,
      texts: parsed.texts ?? DEFAULTS.texts,
      kept:  0,   // always 0 — nothing is ever permanently stored
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(stats: ShareStats): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch {/* ignore */}
}

/**
 * Pull the real counters from the server, cache them, and notify listeners.
 * Silently no-ops if the server is unreachable, keeping the last cached value.
 */
export async function refreshShareStats(): Promise<void> {
  const real = await fetchShareStats();
  if (!real) return;
  save({ files: real.files, texts: real.texts, kept: 0 });
  window.dispatchEvent(new CustomEvent("sharestats"));
}

/**
 * Called right after a successful share. The server already recorded it,
 * so we simply re-fetch the authoritative value.
 */
export function incrementFiles(): void {
  void refreshShareStats();
}

export function incrementTexts(): void {
  void refreshShareStats();
}
