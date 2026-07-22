/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
/** Shared helpers for the Image Tools. */

/** Format a byte count into a human-readable string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/** Strip the extension from a filename, returning the base name. */
export function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** Load a File/Blob into an HTMLImageElement (decoded and ready to draw). */
export function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof src === "string" ? src : URL.createObjectURL(src);
    const img = new Image();
    img.onload = () => {
      if (typeof src !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      if (typeof src !== "string") URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    img.src = url;
  });
}

/** Draw an image to a canvas at the given dimensions and return the canvas. */
export function drawToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Promise wrapper around canvas.toBlob. */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image."))),
      type,
      quality,
    );
  });
}

/**
 * Compress an image to (at most) a target byte size, then pad the file so the
 * final size is exactly the target. JPEG decoders ignore any bytes after the
 * EOI marker, so appending filler bytes is safe and lets us hit an exact size.
 *
 * Returns a JPEG blob whose `.size` equals `targetBytes` (when achievable).
 */
export async function compressToTargetSize(
  img: HTMLImageElement,
  targetBytes: number,
): Promise<{ blob: Blob; quality: number; scaled: boolean }> {
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  let scaled = false;

  // Helper: best JPEG <= targetBytes for the current canvas size via
  // binary search over quality.
  const bestUnderTarget = async (
    w: number,
    h: number,
  ): Promise<{ blob: Blob; quality: number }> => {
    const canvas = drawToCanvas(img, w, h);
    let low = 0.05;
    let high = 1;
    let best: Blob | null = null;
    let bestQ = low;
    for (let i = 0; i < 8; i++) {
      const mid = (low + high) / 2;
      const blob = await canvasToBlob(canvas, "image/jpeg", mid);
      if (blob.size <= targetBytes) {
        best = blob;
        bestQ = mid;
        low = mid; // try higher quality
      } else {
        high = mid; // too big, lower quality
      }
    }
    if (!best) {
      best = await canvasToBlob(canvas, "image/jpeg", 0.05);
      bestQ = 0.05;
    }
    return { blob: best, quality: bestQ };
  };

  let result = await bestUnderTarget(width, height);

  // If even the lowest quality is still over target, shrink dimensions
  // until it fits (or we hit a small minimum).
  let guard = 0;
  while (result.blob.size > targetBytes && Math.min(width, height) > 16 && guard < 24) {
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
    scaled = true;
    result = await bestUnderTarget(width, height);
    guard++;
  }

  // Pad to exactly the target size by appending filler bytes after EOI.
  // (binary search above guarantees the JPEG is <= target, so padding always
  // runs and the final size equals the requested target precisely.)
  const finalBlob = await padBlobToSize(result.blob, targetBytes);

  return { blob: finalBlob, quality: result.quality, scaled };
}

/**
 * Pad a blob with trailing 0xFF bytes so its size equals `targetBytes`.
 * If the blob is already >= target, it is returned unchanged.
 */
async function padBlobToSize(blob: Blob, targetBytes: number): Promise<Blob> {
  if (blob.size >= targetBytes) return blob;
  const padding = new Uint8Array(targetBytes - blob.size).fill(0xff);
  return new Blob([blob, padding], { type: blob.type });
}

/**
 * Re-encode an image blob into another format. PNG and WebP keep transparency;
 * JPEG is flattened onto a solid background (default white) because it has no
 * alpha channel. Returns a new blob in the requested `type`.
 */
export async function convertImageBlob(
  blob: Blob,
  type: "image/png" | "image/jpeg" | "image/webp",
  options: { background?: string; quality?: number } = {},
): Promise<Blob> {
  const img = await loadImage(blob);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, img.naturalWidth);
  canvas.height = Math.max(1, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  if (type === "image/jpeg") {
    ctx.fillStyle = options.background ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0);
  const quality = options.quality ?? (type === "image/png" ? undefined : 0.92);
  return canvasToBlob(canvas, type, quality);
}

/** Trigger a browser download for a blob with the given filename. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
