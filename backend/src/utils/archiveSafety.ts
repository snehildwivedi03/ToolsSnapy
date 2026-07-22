/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { extname } from "path";

/**
 * Decompression-bomb protection.
 *
 * A "zip bomb" is a tiny archive (e.g. 42 KB) that expands to gigabytes/petabytes,
 * often by nesting archives inside archives ("compressed multiple times"). If such a
 * file were stored and later opened by a recipient — or ever extracted server-side —
 * it could exhaust disk/RAM/CPU.
 *
 * This inspector reads only the archive *metadata* (the ZIP central directory and the
 * gzip size trailer). It NEVER decompresses anything, so inspecting the bomb is cheap
 * and safe. It rejects archives whose declared expansion looks abusive.
 */

/** Reject if declared uncompressed output exceeds this (2 GiB). */
const MAX_TOTAL_UNCOMPRESSED = 2 * 1024 * 1024 * 1024;
/** Reject if the uncompressed:compressed ratio exceeds this. */
const MAX_COMPRESSION_RATIO = 120;
/** Reject archives that declare more entries than this. */
const MAX_ENTRIES = 20_000;
/** Minimum compressed size (bytes) before ratio checks kick in (avoids tiny-file noise). */
const RATIO_MIN_COMPRESSED = 4096;

/** Archive extensions that, when nested inside a zip, signal a recursive bomb. */
const NESTED_ARCHIVE_EXTS = new Set([
  ".zip", ".gz", ".tgz", ".7z", ".rar", ".bz2", ".xz", ".tar", ".lz", ".lzma", ".z",
]);

// ZIP record signatures (little-endian).
const SIG_EOCD = 0x06054b50;       // End Of Central Directory
const SIG_EOCD64 = 0x06064b50;     // ZIP64 End Of Central Directory
const SIG_EOCD64_LOC = 0x07064b50; // ZIP64 EOCD locator
const SIG_CDH = 0x02014b50;        // Central Directory File Header
const ZIP64_MARK = 0xffffffff;

export interface ArchiveVerdict {
  /** True when the archive is safe to store/serve. */
  safe: boolean;
  /** Human-readable reason when unsafe. */
  reason?: string;
}

const SAFE: ArchiveVerdict = { safe: true };

/** Locate the End Of Central Directory record by scanning backwards. */
function findEocd(buf: Buffer): number {
  // EOCD is 22 bytes + up to 65535 bytes of comment.
  const minPos = Math.max(0, buf.length - (22 + 0xffff));
  for (let i = buf.length - 22; i >= minPos; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) return i;
  }
  return -1;
}

/** Read the ZIP64 sizes from an extra field, when the 32-bit fields are maxed out. */
function readZip64Extra(
  extra: Buffer,
  needUncompressed: boolean,
  needCompressed: boolean,
): { uncompressed?: number; compressed?: number } {
  let offset = 0;
  while (offset + 4 <= extra.length) {
    const id = extra.readUInt16LE(offset);
    const size = extra.readUInt16LE(offset + 2);
    const dataStart = offset + 4;
    if (id === 0x0001) {
      // Order: uncompressed(8), compressed(8), then others — only present if maxed.
      let p = dataStart;
      const out: { uncompressed?: number; compressed?: number } = {};
      if (needUncompressed && p + 8 <= extra.length) {
        out.uncompressed = Number(extra.readBigUInt64LE(p));
        p += 8;
      }
      if (needCompressed && p + 8 <= extra.length) {
        out.compressed = Number(extra.readBigUInt64LE(p));
      }
      return out;
    }
    offset = dataStart + size;
  }
  return {};
}

/** Inspect a ZIP archive buffer via its central directory (no decompression). */
function inspectZip(buf: Buffer): ArchiveVerdict {
  const eocd = findEocd(buf);
  if (eocd < 0) return { safe: false, reason: "Malformed ZIP archive." };

  let entryCount = buf.readUInt16LE(eocd + 10);
  let cdOffset = buf.readUInt32LE(eocd + 16);

  // ZIP64: resolve real values when the classic fields are maxed out.
  if (entryCount === 0xffff || cdOffset === ZIP64_MARK) {
    const locPos = eocd - 20;
    if (locPos >= 0 && buf.readUInt32LE(locPos) === SIG_EOCD64_LOC) {
      const eocd64 = Number(buf.readBigUInt64LE(locPos + 8));
      if (eocd64 >= 0 && eocd64 + 56 <= buf.length && buf.readUInt32LE(eocd64) === SIG_EOCD64) {
        entryCount = Number(buf.readBigUInt64LE(eocd64 + 32));
        cdOffset = Number(buf.readBigUInt64LE(eocd64 + 48));
      }
    }
  }

  if (entryCount > MAX_ENTRIES) {
    return { safe: false, reason: `Archive declares too many entries (${entryCount}).` };
  }

  let totalUncompressed = 0;
  let totalCompressed = 0;
  let pos = cdOffset;

  for (let i = 0; i < entryCount; i++) {
    if (pos + 46 > buf.length || buf.readUInt32LE(pos) !== SIG_CDH) {
      return { safe: false, reason: "Malformed ZIP central directory." };
    }
    let compressed = buf.readUInt32LE(pos + 20);
    let uncompressed = buf.readUInt32LE(pos + 24);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);

    const nameStart = pos + 46;
    const extraStart = nameStart + nameLen;
    const name = buf.toString("utf8", nameStart, Math.min(extraStart, buf.length));

    // Resolve ZIP64 sizes from the extra field when maxed out.
    if (uncompressed === ZIP64_MARK || compressed === ZIP64_MARK) {
      const extra = buf.subarray(extraStart, extraStart + extraLen);
      const z64 = readZip64Extra(extra, uncompressed === ZIP64_MARK, compressed === ZIP64_MARK);
      if (z64.uncompressed !== undefined) uncompressed = z64.uncompressed;
      if (z64.compressed !== undefined) compressed = z64.compressed;
    }

    // Recursive-bomb signature: an archive that contains more archives.
    const innerExt = extname(name.toLowerCase());
    if (NESTED_ARCHIVE_EXTS.has(innerExt)) {
      return {
        safe: false,
        reason: "Nested archives are not allowed (possible recursive zip bomb).",
      };
    }

    totalUncompressed += uncompressed;
    totalCompressed += compressed;

    if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED) {
      return { safe: false, reason: "Archive expands to an unsafe size." };
    }

    pos = extraStart + extraLen + commentLen;
  }

  if (
    totalCompressed >= RATIO_MIN_COMPRESSED &&
    totalUncompressed / Math.max(1, totalCompressed) > MAX_COMPRESSION_RATIO
  ) {
    return { safe: false, reason: "Archive has a suspicious compression ratio." };
  }

  return SAFE;
}

/** Inspect a gzip member via its ISIZE trailer (no decompression). */
function inspectGzip(buf: Buffer): ArchiveVerdict {
  if (buf.length < 18) return SAFE; // too small to be a threat
  // Last 4 bytes = original (uncompressed) size mod 2^32.
  const isize = buf.readUInt32LE(buf.length - 4);
  const compressed = buf.length;
  if (isize > MAX_TOTAL_UNCOMPRESSED) {
    return { safe: false, reason: "Archive expands to an unsafe size." };
  }
  if (
    compressed >= RATIO_MIN_COMPRESSED &&
    isize / compressed > MAX_COMPRESSION_RATIO
  ) {
    return { safe: false, reason: "Archive has a suspicious compression ratio." };
  }
  return SAFE;
}

/**
 * Inspect an uploaded file for decompression-bomb characteristics.
 * Only ZIP and gzip payloads are analysed (they carry cheap size metadata);
 * everything else is treated as safe here and covered by the size/type limits.
 *
 * @param originalName  The uploaded filename (used for the extension hint).
 * @param buffer        The full file contents in memory.
 */
export function inspectArchive(originalName: string, buffer: Buffer): ArchiveVerdict {
  if (!buffer || buffer.length < 4) return SAFE;

  // Detect by magic bytes rather than trusting the extension.
  const isZip =
    buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b;

  try {
    if (isZip) return inspectZip(buffer);
    if (isGzip) return inspectGzip(buffer);
  } catch {
    // Any parsing failure on something claiming to be an archive is itself suspicious.
    const ext = extname(originalName.toLowerCase());
    if (ext === ".zip" || ext === ".gz" || isZip || isGzip) {
      return { safe: false, reason: "Unreadable or malformed archive." };
    }
  }

  return SAFE;
}
