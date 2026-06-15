import { createWriteStream, existsSync } from "fs";
import { dirname } from "path";
import { mkdir } from "fs/promises";
import type { Archiver, ArchiverOptions } from "archiver";

// archiver is a CommonJS-only package. Load it lazily via dynamic import and
// normalise the default export so it works under tsx / Node 24 ESM.
type ArchiverFactory = (format: "zip" | "tar", options?: ArchiverOptions) => Archiver;

let archiverFactory: ArchiverFactory | null = null;

async function getArchiver(): Promise<ArchiverFactory> {
  if (archiverFactory) return archiverFactory;
  const mod = (await import("archiver")) as unknown as {
    default?: ArchiverFactory;
  } & ArchiverFactory;
  const factory = (mod.default ?? mod) as ArchiverFactory;
  if (typeof factory !== "function") {
    throw new Error("Failed to load archiver module.");
  }
  archiverFactory = factory;
  return factory;
}

export interface FileEntry {
  /** Absolute path to the file on disk */
  diskPath: string;
  /** Relative path to use inside the ZIP */
  zipPath: string;
}

/**
 * Creates a ZIP archive at `destPath` containing all `entries`.
 * Returns the total compressed byte size.
 */
export async function createZip(
  entries: FileEntry[],
  destPath: string,
): Promise<number> {
  await mkdir(dirname(destPath), { recursive: true });
  const createArchiver = await getArchiver();

  return new Promise((resolve, reject) => {
    const output = createWriteStream(destPath);
    const archive = createArchiver("zip", { zlib: { level: 6 } });

    output.on("close", () => resolve(archive.pointer()));
    archive.on("error", reject);

    archive.pipe(output);

    for (const entry of entries) {
      if (existsSync(entry.diskPath)) {
        archive.file(entry.diskPath, { name: entry.zipPath });
      }
    }

    archive.finalize();
  });
}
