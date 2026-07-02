import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* Persisted outside temp/share so routine share cleanup never wipes it. */
const STATS_DIR = join(__dirname, "..", "..", "..", "temp");
const STATS_FILE = join(STATS_DIR, "share-stats.json");

export interface ShareStats {
  files: number; // total individual files/images/PDFs shared
  texts: number; // total text snippets shared
}

/* Seed values so the public counter never starts at a bare zero. */
const SEED: ShareStats = { files: 133, texts: 3299 };

let cache: ShareStats | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function load(): Promise<ShareStats> {
  if (cache) return cache;
  try {
    const raw = await readFile(STATS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<ShareStats>;
    cache = {
      files: Number.isFinite(parsed.files) ? Number(parsed.files) : SEED.files,
      texts: Number.isFinite(parsed.texts) ? Number(parsed.texts) : SEED.texts,
    };
  } catch {
    cache = { ...SEED };
  }
  return cache;
}

/* Serialize disk writes so concurrent shares can't corrupt the file. */
function persist(stats: ShareStats): Promise<void> {
  writeQueue = writeQueue
    .then(async () => {
      await mkdir(STATS_DIR, { recursive: true });
      await writeFile(STATS_FILE, JSON.stringify(stats));
    })
    .catch(() => {
      /* stats are best-effort; never let a write failure bubble up */
    });
  return writeQueue;
}

export async function getShareStats(): Promise<ShareStats> {
  return { ...(await load()) };
}

/** Record that one text snippet was shared. */
export async function addTextShare(): Promise<void> {
  const s = await load();
  s.texts += 1;
  await persist(s);
}

/** Record that `count` files were shared (folders count each file). */
export async function addFileShares(count: number): Promise<void> {
  if (!Number.isFinite(count) || count <= 0) return;
  const s = await load();
  s.files += Math.floor(count);
  await persist(s);
}
