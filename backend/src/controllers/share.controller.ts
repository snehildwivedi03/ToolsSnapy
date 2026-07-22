/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import type { Request, Response } from "express";
import { join, resolve, sep, extname } from "path";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import { createTextShare, getShareMetadata } from "../services/share/shareText.service.js";
import {
  createFileShare,
  LIMITS_FILES,
  LIMITS_IMAGES,
  LIMITS_PDFS,
} from "../services/share/shareFiles.service.js";
import { SHARE_ROOT } from "../services/share/shareText.service.js";
import {
  getShareStats,
  addTextShare,
  addFileShares,
} from "../services/share/shareStats.service.js";

function safeCode(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const code = (typeof value === "string" ? value : "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length === 6 ? code : null;
}

// Content types that are safe to render inline in a browser. Anything not on
// this list (SVG, HTML, scripts, unknown types) is force-downloaded so it can
// never execute in the user's session (prevents stored XSS via shared files).
const INLINE_SAFE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

// Applied to every file we serve: stop MIME sniffing and neutralise any active
// content (scripts, embedded objects) even if a byte-check was somehow bypassed.
function applyDownloadSecurityHeaders(res: Response): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  res.setHeader("X-Frame-Options", "DENY");
}

/* ── POST /api/share/text ───────────────────────────────── */
export async function shareText(req: Request, res: Response): Promise<void> {
  const text: unknown = req.body?.text;

  if (typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ success: false, message: "Text is required." });
    return;
  }

  if (text.length > 50_000) {
    res.status(400).json({ success: false, message: "Text exceeds 50,000 character limit." });
    return;
  }

  try {
    const meta = await createTextShare(text.trim());
    try { await addTextShare(); } catch { /* stats are best-effort */ }
    res.status(201).json({
      success: true,
      code: meta.code,
      expiresAt: meta.expiresAt,
    });
  } catch (err) {
    console.error("[share/text]", err);
    res.status(500).json({ success: false, message: "Could not create share." });
  }
}

/* ── POST /api/share/files ──────────────────────────────── */
export async function shareFiles(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    res.status(400).json({ success: false, message: "No files provided." });
    return;
  }

  const folderName = typeof req.body?.folderName === "string"
    ? req.body.folderName.slice(0, 150)
    : undefined;

  try {
    const { meta, errors } = await createFileShare(files, LIMITS_FILES, folderName);
    if ((meta.fileCount ?? 0) === 0) {
      res.status(400).json({ success: false, message: "No valid files.", errors });
      return;
    }
    try { await addFileShares(meta.fileCount ?? 0); } catch { /* stats are best-effort */ }
    res.status(201).json({ success: true, code: meta.code, expiresAt: meta.expiresAt, errors });
  } catch (err) {
    console.error("[share/files]", err);
    res.status(500).json({ success: false, message: "Could not create share." });
  }
}

/* ── POST /api/share/images ─────────────────────────────── */
export async function shareImages(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    res.status(400).json({ success: false, message: "No images provided." });
    return;
  }

  try {
    const { meta, errors } = await createFileShare(files, LIMITS_IMAGES);
    if ((meta.fileCount ?? 0) === 0) {
      res.status(400).json({ success: false, message: "No valid images.", errors });
      return;
    }
    try { await addFileShares(meta.fileCount ?? 0); } catch { /* stats are best-effort */ }
    res.status(201).json({ success: true, code: meta.code, expiresAt: meta.expiresAt, errors });
  } catch (err) {
    console.error("[share/images]", err);
    res.status(500).json({ success: false, message: "Could not create share." });
  }
}

/* ── POST /api/share/pdfs ───────────────────────────────── */
export async function sharePdfs(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    res.status(400).json({ success: false, message: "No PDFs provided." });
    return;
  }

  try {
    const { meta, errors } = await createFileShare(files, LIMITS_PDFS);
    if ((meta.fileCount ?? 0) === 0) {
      res.status(400).json({ success: false, message: "No valid PDFs.", errors });
      return;
    }
    try { await addFileShares(meta.fileCount ?? 0); } catch { /* stats are best-effort */ }
    res.status(201).json({ success: true, code: meta.code, expiresAt: meta.expiresAt, errors });
  } catch (err) {
    console.error("[share/pdfs]", err);
    res.status(500).json({ success: false, message: "Could not create share." });
  }
}

/* ── GET /api/share/:code ───────────────────────────────── */
export async function shareStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getShareStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error("[share/stats]", err);
    res.status(500).json({ success: false, message: "Could not load stats." });
  }
}

export async function receiveShare(req: Request, res: Response): Promise<void> {
  const code = safeCode(req.params["code"] ?? "");
  if (!code) {
    res.status(400).json({ success: false, message: "Invalid share code." });
    return;
  }

  const meta = await getShareMetadata(code);
  if (!meta) {
    res.status(404).json({ success: false, message: "Share not found or expired." });
    return;
  }

  // Strip sensitive content from file-type responses (content is for text only)
  const payload: Record<string, unknown> = {
    code: meta.code,
    type: meta.type,
    expiresAt: meta.expiresAt,
  };

  if (meta.type === "text") {
    payload["content"] = meta.content;
  } else {
    payload["files"] = meta.files?.map((f) => ({ name: f.name, path: f.path, size: f.size }));
    payload["totalSize"] = meta.totalSize;
    payload["fileCount"] = meta.fileCount;
    payload["folderName"] = meta.folderName;
    payload["hasZip"] = existsSync(join(SHARE_ROOT, code, "archive.zip"));
  }

  res.json({ success: true, share: payload });
}

/* ── GET /api/share/:code/download/zip ──────────────────── */
export async function downloadZip(req: Request, res: Response): Promise<void> {
  const code = safeCode(req.params["code"] ?? "");
  if (!code) { res.status(400).json({ success: false, message: "Invalid code." }); return; }

  const meta = await getShareMetadata(code);
  if (!meta || meta.type !== "files") {
    res.status(404).json({ success: false, message: "Not found." });
    return;
  }

  const zipPath = join(SHARE_ROOT, code, "archive.zip");
  if (!existsSync(zipPath)) {
    res.status(404).json({ success: false, message: "Archive not available." });
    return;
  }

  applyDownloadSecurityHeaders(res);
  res.setHeader("Content-Disposition", `attachment; filename="share-${code}.zip"`);
  res.setHeader("Content-Type", "application/zip");
  res.sendFile(zipPath);
}

/* ── GET /api/share/:code/download/file?path=... ────────── */
export async function downloadFile(req: Request, res: Response): Promise<void> {
  const code = safeCode(req.params["code"] ?? "");
  if (!code) { res.status(400).json({ success: false, message: "Invalid code." }); return; }

  const meta = await getShareMetadata(code);
  if (!meta || meta.type !== "files") {
    res.status(404).json({ success: false, message: "Not found." });
    return;
  }

  const rawPath = req.query["path"] as string | undefined;
  if (!rawPath) { res.status(400).json({ success: false, message: "Missing path." }); return; }

  // Validate that the requested path is in the file list (prevents traversal)
  const match = meta.files?.find((f) => f.path === rawPath);
  if (!match) {
    res.status(404).json({ success: false, message: "File not found." });
    return;
  }

  // Defense-in-depth: even though rawPath was matched against the stored,
  // pre-sanitised file list, re-verify the resolved path stays inside the
  // share's own files directory before touching the disk.
  const filesRoot = resolve(join(SHARE_ROOT, code, "files"));
  const filePath = resolve(join(filesRoot, rawPath));
  if (filePath !== filesRoot && !filePath.startsWith(filesRoot + sep)) {
    res.status(400).json({ success: false, message: "Invalid path." });
    return;
  }

  applyDownloadSecurityHeaders(res);

  const ext = extname(match.name).toLowerCase();
  const inlineType = INLINE_SAFE_TYPES[ext];

  // Only serve inline for known-safe types; anything else is force-downloaded
  // so it can never be rendered/executed in the browser.
  if (req.query["inline"] === "1" && inlineType) {
    res.setHeader("Content-Type", inlineType);
    res.setHeader("Content-Disposition", `inline; filename="${match.name.replace(/[^\w.\-]/g, "_")}"`);
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) res.status(500).json({ success: false, message: "Could not load file." });
    });
    return;
  }

  res.download(filePath, match.name, (err) => {
    if (err && !res.headersSent) res.status(500).json({ success: false, message: "Download failed." });
  });
}

/* ── DELETE /api/share/:code ────────────────────────────── */
export async function deleteShare(req: Request, res: Response): Promise<void> {
  const code = safeCode(req.params["code"] ?? "");
  if (!code) {
    res.status(400).json({ success: false, message: "Invalid code." });
    return;
  }

  // Always remove this share's temp folder if it exists  even when the
  // metadata is missing or already expired  so no orphaned files are left
  // behind in temp/share. safeCode() guarantees `code` is a 6-char A-Z0-9
  // value, so the target can never resolve to SHARE_ROOT itself.
  const shareDir = join(SHARE_ROOT, code);
  if (!existsSync(shareDir)) {
    res.status(404).json({ success: false, message: "Share not found or already expired." });
    return;
  }

  try {
    await rm(shareDir, { recursive: true, force: true });
    res.json({ success: true, message: "Share deleted." });
  } catch (err) {
    console.error("[share/delete]", err);
    res.status(500).json({ success: false, message: "Could not delete share." });
  }
}
