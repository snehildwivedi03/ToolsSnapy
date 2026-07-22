/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
/** Shared helpers for the PDF Tools. */

// Reuse the generic byte/name/download helpers from the image tools.
export { formatBytes, baseName, downloadBlob } from "../../Images/tools/imageUtils";

/** Read a File into an ArrayBuffer. */
export function readArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse a page-selection string like "1-3, 5, 8-10" into a sorted list of
 * unique zero-based page indices. Validates against the total page count.
 * Throws an Error with a friendly message on invalid input.
 */
export function parsePageSelection(input: string, totalPages: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter the pages you want to keep.");

  const indices = new Set<number>();
  for (const rawToken of trimmed.split(",")) {
    const token = rawToken.trim();
    if (!token) continue;

    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = token.match(/^(\d+)$/);

    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
        throw new Error(`Pages must be between 1 and ${totalPages}.`);
      }
      const [lo, hi] = start <= end ? [start, end] : [end, start];
      for (let p = lo; p <= hi; p++) indices.add(p - 1);
    } else if (singleMatch) {
      const page = Number(singleMatch[1]);
      if (page < 1 || page > totalPages) {
        throw new Error(`Pages must be between 1 and ${totalPages}.`);
      }
      indices.add(page - 1);
    } else {
      throw new Error(`"${token}" is not a valid page or range.`);
    }
  }

  if (indices.size === 0) throw new Error("Enter the pages you want to keep.");
  return [...indices].sort((a, b) => a - b);
}
