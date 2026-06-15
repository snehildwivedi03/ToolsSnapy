import multer from "multer";

/** Multer instance for share uploads: 500 MB total, 100 files max.
 *  memoryStorage keeps files in buffer — avoids staging-dir rename issues
 *  and works reliably cross-platform with Node 24 ESM. */
export const shareUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024,   // 500 MB per file (enforced per-tool on frontend)
    files: 100,
  },
});
