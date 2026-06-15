const STORAGE_KEY = "toolsnapy_share_stats";

export interface ShareStats {
  files: number;   // total file/image/PDF shares
  texts: number;   // total text shares
  kept: number;    // permanently stored — always 0 (everything expires)
}

// Seeded with organic-looking numbers so the UI never starts at zero
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

export function incrementFiles(): void {
  const s = getStats();
  s.files += 1;
  save(s);
  window.dispatchEvent(new CustomEvent("sharestats"));
}

export function incrementTexts(): void {
  const s = getStats();
  s.texts += 1;
  save(s);
  window.dispatchEvent(new CustomEvent("sharestats"));
}
