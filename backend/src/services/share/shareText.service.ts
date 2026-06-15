import { mkdir, writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { generateShareCode } from "../../utils/generateShareCode.js";
import type { ShareMetadata } from "../../types/share.types.js";
import { EXPIRY_MS } from "../../types/share.types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SHARE_ROOT = join(__dirname, "..", "..", "..", "temp", "share");

export async function createTextShare(text: string): Promise<ShareMetadata> {
  const code = generateShareCode();
  const now = Date.now();
  const shareDir = join(SHARE_ROOT, code);

  await mkdir(shareDir, { recursive: true });

  const meta: ShareMetadata = {
    code,
    type: "text",
    createdAt: now,
    expiresAt: now + EXPIRY_MS,
    content: text,
  };

  await writeFile(join(shareDir, "metadata.json"), JSON.stringify(meta, null, 2));
  return meta;
}

export async function getShareMetadata(code: string): Promise<ShareMetadata | null> {
  const safeCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (safeCode.length !== 6) return null;

  try {
    const raw = await readFile(join(SHARE_ROOT, safeCode, "metadata.json"), "utf8");
    const meta: ShareMetadata = JSON.parse(raw);

    if (Date.now() > meta.expiresAt) return null;

    return meta;
  } catch {
    return null;
  }
}
