import type { Request, Response } from "express";
import { join } from "path";
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

function safeCode(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const code = (typeof value === "string" ? value : "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length === 6 ? code : null;
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
    res.status(201).json({ success: true, code: meta.code, expiresAt: meta.expiresAt, errors });
  } catch (err) {
    console.error("[share/pdfs]", err);
    res.status(500).json({ success: false, message: "Could not create share." });
  }
}

/* ── GET /api/share/:code ───────────────────────────────── */
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

  const filePath = join(SHARE_ROOT, code, "files", rawPath);

  // When ?inline=1 is passed, serve the file inline (for image/PDF previews)
  // instead of forcing a download.
  if (req.query["inline"] === "1") {
    res.sendFile(filePath, (err) => {
      if (err) res.status(500).json({ success: false, message: "Could not load file." });
    });
    return;
  }

  res.download(filePath, match.name, (err) => {
    if (err) res.status(500).json({ success: false, message: "Download failed." });
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
