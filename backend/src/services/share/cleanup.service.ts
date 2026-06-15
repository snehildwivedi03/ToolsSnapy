import { readdir, rm, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { SHARE_ROOT } from "./shareText.service.js";
import type { ShareMetadata } from "../../types/share.types.js";

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function sweep() {
  let entries: string[];
  try {
    entries = await readdir(SHARE_ROOT);
  } catch {
    return; // temp dir doesn't exist yet
  }

  const now = Date.now();

  for (const code of entries) {
    if (code === "_staging") continue; // skip staging dir

    const metaPath = join(SHARE_ROOT, code, "metadata.json");
    try {
      const raw = await readFile(metaPath, "utf8");
      const meta: ShareMetadata = JSON.parse(raw);

      if (now > meta.expiresAt) {
        await rm(join(SHARE_ROOT, code), { recursive: true, force: true });
        console.log(`[cleanup] Removed expired share: ${code}`);
      }
    } catch {
      // Malformed / partially created directory – clean up if older than 1 hour
      // (We can't read metadata, so we fall through silently)
    }
  }

  // Also clean staging
  try {
    const staging = join(SHARE_ROOT, "_staging");
    const stageDirs = await readdir(staging);
    for (const ts of stageDirs) {
      const age = now - Number(ts);
      if (age > 60 * 60 * 1000) { // older than 1 hour
        await rm(join(staging, ts), { recursive: true, force: true });
      }
    }
  } catch {
    // ignore
  }
}

export function startCleanupService() {
  void sweep(); // run once on start
  setInterval(() => void sweep(), INTERVAL_MS);
}
