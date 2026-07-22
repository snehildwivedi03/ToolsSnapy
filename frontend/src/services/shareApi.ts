/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
// Default to a relative base ("") so requests go to the same host that served
// the page and are handled by the Vite dev proxy (/api → backend). Using an
// absolute "localhost" URL breaks cross-device access (e.g. phone over port
// forwarding), where "localhost" points at the device itself. Set VITE_API_URL
// only when the API is hosted on a different origin.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

/** Friendly message shown when the request never reached the server. */
export const NETWORK_ERROR =
  "We couldn't connect. Please check your internet connection and try again.";

/** Turn an HTTP status code into a short, plain-English message. */
export function friendlyStatus(status: number): string {
  switch (status) {
    case 400: return "Something was wrong with your request (400). Please check and try again.";
    case 401: return "You need to sign in to do this (401).";
    case 403: return "You don't have permission to do this (403).";
    case 404: return "We couldn't find that (404). It may have expired or been removed.";
    case 408: return "The request took too long (408). Please try again.";
    case 409: return "That conflicts with something that already exists (409).";
    case 413: return "Your upload is too large (413). Try fewer or smaller files.";
    case 415: return "That file type isn't supported (415).";
    case 422: return "We couldn't process that input (422). Please check and try again.";
    case 429: return "You're doing that too fast (429). Please wait a moment and try again.";
    case 500: return "Something went wrong on our end (500). Please try again shortly.";
    case 502:
    case 503:
    case 504: return `Our service is temporarily unavailable (${status}). Please try again shortly.`;
    default:
      if (status >= 500) return `Our service hit a problem (${status}). Please try again shortly.`;
      if (status >= 400) return `Something went wrong with your request (${status}). Please try again.`;
      return `Something went wrong (${status}). Please try again.`;
  }
}

/** Safely parse a JSON body; returns null if the body isn't valid JSON. */
async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

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

export interface ShareStatsData {
  files: number;
  texts: number;
}

/** Fetch the real, server-side share counters. Returns null on any failure. */
export async function fetchShareStats(): Promise<ShareStatsData | null> {
  try {
    const res = await fetch(`${BASE}/api/share/stats`);
    const data = await safeJson<{ success: boolean; stats?: ShareStatsData }>(res);
    if (!res.ok || !data?.success || !data.stats) return null;
    return data.stats;
  } catch {
    return null;
  }
}

export async function shareText(text: string): Promise<ShareUploadResult> {
  try {
    const res = await fetch(`${BASE}/api/share/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await safeJson<ShareUploadResult>(res);
    if (!res.ok) {
      return { success: false, message: data?.message ?? friendlyStatus(res.status) };
    }
    return data ?? { success: false, message: "We got an unexpected response. Please try again." };
  } catch {
    return { success: false, message: NETWORK_ERROR };
  }
}

export async function shareFiles(
  files: File[],
  endpoint: "files" | "images" | "pdfs",
  folderName?: string,
  onProgress?: (percent: number) => void,
): Promise<ShareUploadResult> {
  const fd = new FormData();
  for (const f of files) {
    fd.append("files", f, f.webkitRelativePath || f.name);
  }
  if (folderName) fd.append("folderName", folderName);

  // Without a progress callback, keep the lightweight fetch path.
  if (!onProgress) {
    try {
      const res = await fetch(`${BASE}/api/share/${endpoint}`, {
        method: "POST",
        body: fd,
      });
      const data = await safeJson<ShareUploadResult>(res);
      if (!res.ok) {
        return { success: false, message: data?.message ?? friendlyStatus(res.status) };
      }
      return data ?? { success: false, message: "We got an unexpected response. Please try again." };
    } catch {
      return { success: false, message: NETWORK_ERROR };
    }
  }

  // XHR gives us real upload progress events that fetch() cannot.
  return new Promise<ShareUploadResult>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/api/share/${endpoint}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      onProgress(100);
      let data: ShareUploadResult | null = null;
      try {
        data = JSON.parse(xhr.responseText) as ShareUploadResult;
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data ?? { success: false, message: "We got an unexpected response. Please try again." });
      } else {
        resolve({ success: false, message: data?.message ?? friendlyStatus(xhr.status) });
      }
    };
    xhr.onerror = () => resolve({ success: false, message: NETWORK_ERROR });
    xhr.ontimeout = () => resolve({ success: false, message: "The upload took too long (408). Please try again." });
    xhr.send(fd);
  });
}

export async function receiveShare(code: string): Promise<ShareReceiveResult> {
  const safeCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  try {
    const res = await fetch(`${BASE}/api/share/${safeCode}`);
    const data = await safeJson<ShareReceiveResult>(res);
    if (!res.ok) {
      return { success: false, message: data?.message ?? friendlyStatus(res.status) };
    }
    return data ?? { success: false, message: "We got an unexpected response. Please try again." };
  } catch {
    return { success: false, message: NETWORK_ERROR };
  }
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
