/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { createWriteStream, existsSync } from "fs";
import { dirname } from "path";
import { mkdir } from "fs/promises";
import type { Archiver, ArchiverOptions } from "archiver";

// archiver v8 is an ESM module that exposes dedicated format classes
// (`ZipArchive`, `TarArchive`, …) constructed with just an options object.
// Older v7 exposed a single callable factory: archiver("zip", options).
// Load lazily via dynamic import and support both shapes.
type ZipCtor = new (options?: ArchiverOptions) => Archiver;
type ArchiverFactory = (format: "zip" | "tar", options?: ArchiverOptions) => Archiver;

let createArchive: ArchiverFactory | null = null;

async function getArchiver(): Promise<ArchiverFactory> {
  if (createArchive) return createArchive;

  const mod = (await import("archiver")) as unknown as {
    ZipArchive?: ZipCtor;
    default?: ArchiverFactory;
  };

  // v8: dedicated ZipArchive class (options-only constructor).
  if (typeof mod.ZipArchive === "function") {
    const Zip = mod.ZipArchive;
    createArchive = (_format, options) => new Zip(options);
    return createArchive;
  }

  // v7 and earlier: callable default (or namespace) export.
  const factory = (mod.default ?? (mod as unknown as ArchiverFactory)) as ArchiverFactory;
  if (typeof factory !== "function") {
    throw new Error("Failed to load archiver module.");
  }
  createArchive = factory;
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
