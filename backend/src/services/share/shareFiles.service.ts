/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { mkdir, writeFile } from "fs/promises";
import { join, dirname, extname, basename } from "path";
import type { Express } from "express";
import { generateShareCode } from "../../utils/generateShareCode.js";
import { sanitizeName, validateFile } from "../../utils/fileValidation.js";
import { inspectArchive } from "../../utils/archiveSafety.js";
import { createZip } from "../../utils/zipFiles.js";
import type { ShareMetadata, FileInfo } from "../../types/share.types.js";
import { EXPIRY_MS } from "../../types/share.types.js";
import { SHARE_ROOT } from "./shareText.service.js";

export interface FileShareLimits {
  maxFiles: number;
  maxPerFile: number;   // bytes
  maxTotal: number;     // bytes
  allowedExtensions?: Set<string>;
}

export const LIMITS_FILES: FileShareLimits = {
  maxFiles: 100,
  maxPerFile: 500 * 1024 * 1024,
  maxTotal: 500 * 1024 * 1024,
};

export const LIMITS_IMAGES: FileShareLimits = {
  maxFiles: 50,
  maxPerFile: 10 * 1024 * 1024,
  maxTotal: 250 * 1024 * 1024,
  allowedExtensions: new Set([".png", ".jpg", ".jpeg", ".webp"]),
};

export const LIMITS_PDFS: FileShareLimits = {
  maxFiles: 25,
  maxPerFile: 25 * 1024 * 1024,
  maxTotal: 250 * 1024 * 1024,
  allowedExtensions: new Set([".pdf"]),
};

export interface CreateFileShareResult {
  meta: ShareMetadata;
  errors: string[];
}

export async function createFileShare(
  files: Express.Multer.File[],
  limits: FileShareLimits,
  folderName?: string,
): Promise<CreateFileShareResult> {
  const errors: string[] = [];
  const code = generateShareCode();
  const now = Date.now();
  const shareDir = join(SHARE_ROOT, code, "files");

  await mkdir(shareDir, { recursive: true });

  // Validate counts before touching anything
  if (files.length > limits.maxFiles) {
    errors.push(`Too many files. Maximum is ${limits.maxFiles}.`);
    return { meta: buildEmpty(code, now), errors };
  }

  const accepted: FileInfo[] = [];
  const zipEntries: Array<{ diskPath: string; zipPath: string }> = [];
  let totalSize = 0;

  for (const f of files) {
    // Per-file size check
    if (f.size > limits.maxPerFile) {
      errors.push(`${f.originalname}: exceeds per-file size limit.`);
      continue;
    }

    // Extension check
    const ext = extname(f.originalname).toLowerCase();
    if (limits.allowedExtensions && !limits.allowedExtensions.has(ext)) {
      errors.push(`${f.originalname}: file type not allowed here.`);
      continue;
    }

    // Sanitize the name / relative path
    // webkitRelativePath comes through as originalname when folder upload is used
    const safePath = sanitizeName(f.originalname);
    if (!safePath) {
      errors.push(`${f.originalname}: invalid filename.`);
      continue;
    }

    // Magic-byte validation using the in-memory buffer (memoryStorage)
    if (!f.buffer || f.buffer.length === 0) {
      errors.push(`${f.originalname}: empty or missing file data.`);
      continue;
    }
    const firstBytes = f.buffer.subarray(0, 16) as Buffer;

    const validationErr = validateFile(basename(safePath), firstBytes);
    if (validationErr) {
      errors.push(`${f.originalname}: ${validationErr.reason}`);
      continue;
    }

    // Decompression-bomb guard: inspect archive metadata only (no extraction).
    // Rejects tiny archives that declare a huge expansion or nest other archives
    // ("compressed multiple times") before we ever store or serve them.
    const archiveVerdict = inspectArchive(f.originalname, f.buffer);
    if (!archiveVerdict.safe) {
      errors.push(`${f.originalname}: ${archiveVerdict.reason}`);
      continue;
    }

    // Write buffer to share directory (preserving relative path)
    const destPath = join(shareDir, safePath);
    await mkdir(dirname(destPath), { recursive: true });
    await writeFile(destPath, f.buffer);

    totalSize += f.size;
    accepted.push({ name: basename(safePath), path: safePath, size: f.size });
    zipEntries.push({ diskPath: destPath, zipPath: safePath });
  }

  // Reject if total size exceeded
  if (totalSize > limits.maxTotal) {
    errors.push(`Total size exceeds limit.`);
    return { meta: buildEmpty(code, now), errors };
  }

  // Create ZIP only when there is more than one file.
  // A single file (e.g. one image) is shared as-is, no archive.
  const zipPath = join(SHARE_ROOT, code, "archive.zip");
  if (zipEntries.length > 1) {
    await createZip(zipEntries, zipPath);
  }

  const meta: ShareMetadata = {
    code,
    type: "files",
    createdAt: now,
    expiresAt: now + EXPIRY_MS,
    files: accepted,
    totalSize,
    fileCount: accepted.length,
    folderName: folderName ?? undefined,
  };

  await writeFile(
    join(SHARE_ROOT, code, "metadata.json"),
    JSON.stringify(meta, null, 2),
  );

  return { meta, errors };
}

function buildEmpty(code: string, now: number): ShareMetadata {
  return {
    code,
    type: "files",
    createdAt: now,
    expiresAt: now + EXPIRY_MS,
    files: [],
    totalSize: 0,
    fileCount: 0,
  };
}
