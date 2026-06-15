const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000";

export interface ShareUploadResult {
  success: boolean;
  code?: string;
  expiresAt?: number;
  errors?: string[];
  message?: string;
}

export interface ShareReceiveResult {
  success: boolean;
  share?: {
    code: string;
    type: "text" | "files";
    expiresAt: number;
    content?: string;
    files?: { name: string; path: string; size: number }[];
    totalSize?: number;
    fileCount?: number;
    folderName?: string;
    hasZip?: boolean;
  };
  message?: string;
}

export async function shareText(text: string): Promise<ShareUploadResult> {
  const res = await fetch(`${BASE}/api/share/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json() as Promise<ShareUploadResult>;
}

export async function shareFiles(
  files: File[],
  endpoint: "files" | "images" | "pdfs",
  folderName?: string,
): Promise<ShareUploadResult> {
  const fd = new FormData();
  for (const f of files) {
    fd.append("files", f, f.webkitRelativePath || f.name);
  }
  if (folderName) fd.append("folderName", folderName);

  const res = await fetch(`${BASE}/api/share/${endpoint}`, {
    method: "POST",
    body: fd,
  });
  return res.json() as Promise<ShareUploadResult>;
}

export async function receiveShare(code: string): Promise<ShareReceiveResult> {
  const safeCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const res = await fetch(`${BASE}/api/share/${safeCode}`);
  return res.json() as Promise<ShareReceiveResult>;
}

export function downloadZipUrl(code: string): string {
  return `${BASE}/api/share/${code}/download/zip`;
}

export function downloadFileUrl(code: string, path: string): string {
  return `${BASE}/api/share/${code}/download/file?path=${encodeURIComponent(path)}`;
}

export function previewFileUrl(code: string, path: string): string {
  return `${BASE}/api/share/${code}/download/file?path=${encodeURIComponent(path)}&inline=1`;
}

export async function deleteShare(code: string): Promise<{ success: boolean; message?: string }> {
  const safeCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const res = await fetch(`${BASE}/api/share/${safeCode}`, { method: "DELETE" });
  return res.json() as Promise<{ success: boolean; message?: string }>;
}
