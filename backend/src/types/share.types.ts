export interface FileInfo {
  name: string;   // display name (sanitized base name)
  path: string;   // relative path inside the share directory
  size: number;
}

export interface ShareMetadata {
  code: string;
  type: "text" | "files";
  createdAt: number;   // unix ms
  expiresAt: number;   // unix ms
  // --- text shares ---
  content?: string;
  // --- file shares ---
  files?: FileInfo[];
  totalSize?: number;
  fileCount?: number;
  folderName?: string;
}

export const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
export const TEMP_DIR_NAME = "temp";
