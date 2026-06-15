// Magic-byte signatures for allowed file types.
// Format: { mime, magicBytes, offset }
interface Sig {
  mime: string;
  bytes: number[];
  offset?: number;
}

const SIGNATURES: Sig[] = [
  { mime: "image/png",  bytes: [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a] },
  { mime: "image/jpeg", bytes: [0xff,0xd8,0xff] },
  { mime: "application/zip", bytes: [0x50,0x4b,0x03,0x04] },
  { mime: "application/pdf",  bytes: [0x25,0x50,0x44,0x46] }, // %PDF
  // WEBP: RIFF????WEBP
  { mime: "image/webp", bytes: [0x52,0x49,0x46,0x46] },
];

// Extensions explicitly blocked regardless of content
const BLOCKED_EXTENSIONS = new Set([
  ".exe",".bat",".cmd",".sh",".bash",".ps1",".psm1",
  ".apk",".msi",".dmg",".deb",".rpm",
  ".jar",".py",".rb",".php",".pl",".vbs",".hta",
  ".scr",".com",".pif",".reg",".inf",
]);

// Allowed extensions (whitelist)
const ALLOWED_EXTENSIONS = new Set([
  ".png",".jpg",".jpeg",".webp",".gif",".svg",
  ".pdf",
  ".txt",".md",".csv",".json",".xml",".yaml",".yml",
  ".docx",".xlsx",".pptx",".doc",".xls",".ppt",
  ".zip",".7z",".tar",".gz",".rar",
  ".mp3",".mp4",".wav",".webm",".ogg",
  ".ttf",".otf",".woff",".woff2",
]);

export interface ValidationError {
  file: string;
  reason: string;
}

/**
 * Sanitize a filename/path component, preventing path traversal.
 * Returns the safe base name or null if the name is unusable.
 */
export function sanitizeName(name: string): string | null {
  if (!name) return null;

  // Limit length
  if (name.length > 150) return null;

  // Strip path separators and double-dots
  let safe = name
    .replace(/\\/g, "/")          // normalise slashes
    .split("/")
    .filter((p) => p !== ".." && p !== "." && p.length > 0)
    .join("/");

  // Reject empty result or names that are purely dots
  if (!safe || /^\.+$/.test(safe)) return null;

  // Remove leading dots from each path segment (hidden file prevention)
  safe = safe
    .split("/")
    .map((seg) => seg.replace(/^\.+/, "") || "_")
    .join("/");

  return safe;
}

/**
 * Given the extension and the first 12 bytes of a file buffer,
 * decide whether the file is allowed.
 */
export function validateFile(
  originalName: string,
  firstBytes: Buffer,
): ValidationError | null {
  const lowerName = originalName.toLowerCase();
  const ext = "." + lowerName.split(".").pop()!;

  // Blocked extension → hard reject
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { file: originalName, reason: "File type not permitted." };
  }

  // Not on whitelist → reject
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { file: originalName, reason: "Unsupported file type." };
  }

  // For EXE-like content, check magic bytes
  if (firstBytes.length >= 2) {
    if (firstBytes[0] === 0x4d && firstBytes[1] === 0x5a) {
      // MZ header = Windows executable regardless of extension
      return { file: originalName, reason: "Executable content detected." };
    }
    // ELF (Linux executable)
    if (firstBytes[0] === 0x7f && firstBytes[1] === 0x45 &&
        firstBytes[2] === 0x4c && firstBytes[3] === 0x46) {
      return { file: originalName, reason: "Executable content detected." };
    }
  }

  // For images, verify magic bytes match claimed type
  if ([".png",".jpg",".jpeg",".webp"].includes(ext)) {
    const match = SIGNATURES.find((s) => s.mime.startsWith("image/"));
    if (match) {
      const ok = SIGNATURES.filter((s) => s.mime.startsWith("image/")).some((sig) =>
        sig.bytes.every((b, i) => firstBytes[i] === b),
      );
      if (!ok) {
        return { file: originalName, reason: "Image header mismatch." };
      }
    }
  }

  // PDF: first 4 bytes must be %PDF
  if (ext === ".pdf") {
    const pdfSig = [0x25,0x50,0x44,0x46];
    if (!pdfSig.every((b, i) => firstBytes[i] === b)) {
      return { file: originalName, reason: "PDF header mismatch." };
    }
  }

  return null; // valid
}
