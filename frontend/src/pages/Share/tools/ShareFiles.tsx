/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useCallback, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import Toast from "../../../components/Toast/Toast";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import t from "./ShareTool.module.css";
import tp from "../../../styles/toolpage.module.css";
import { shareFiles } from "../../../services/shareApi";
import { incrementFiles } from "../../../services/shareCounter";

interface UploadResult {
  code: string;
  expiresAt: number;
  errors: string[];
}

const MAX_FILES = 100;
const MAX_TOTAL_MB = 500;
const MAX_PER_FILE_MB = 500;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatCountdown(expiresAt: number): string {
  const diff = Math.max(0, expiresAt - Date.now());
  const m = Math.floor(diff / 60_000);
  const sec = Math.floor((diff % 60_000) / 1000);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const ShareFiles = () => {
  const [files,    setFiles]    = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors,   setErrors]   = useState<string[]>([]);
  const [result,   setResult]   = useState<UploadResult | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [toast,    setToast]    = useState(false);
  const [, setTick]     = useState(0);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const resultRef      = useRef<HTMLDivElement>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const addFiles = useCallback((incoming: File[]) => {
    setErrors([]);
    const clientErrors: string[] = [];
    const valid = incoming.filter((f) => {
      if (f.size > MAX_PER_FILE_MB * 1024 * 1024) {
        clientErrors.push(`${f.name}: exceeds ${MAX_PER_FILE_MB} MB per-file limit.`);
        return false;
      }
      return true;
    });
    setFiles((prev) => {
      const combined = [...prev, ...valid];
      const totalSize = combined.reduce((a, f) => a + f.size, 0);
      if (combined.length > MAX_FILES) {
        clientErrors.push(`Maximum ${MAX_FILES} files allowed.`);
        return prev;
      }
      if (totalSize > MAX_TOTAL_MB * 1024 * 1024) {
        clientErrors.push(`Total size would exceed ${MAX_TOTAL_MB} MB.`);
        return prev;
      }
      return combined;
    });
    if (clientErrors.length) setErrors(clientErrors);
    if (valid.length > 0) {
      setAddedToast(`${valid.length} file${valid.length !== 1 ? "s" : ""} selected`);
      setTimeout(() => shareButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
    }
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dt = e.dataTransfer;
    addFiles(Array.from(dt.files));
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const upload = async () => {
    if (!files.length) return;
    setErrors([]);
    setLoading(true);
    setProgress(0);

    // Detect folder name from first file's relative path
    const firstRelative = files[0]?.webkitRelativePath ?? "";
    const folderName = firstRelative.includes("/")
      ? firstRelative.split("/")[0]
      : undefined;

    try {
      const res = await shareFiles(files, "files", folderName, setProgress);
      setProgress(100);
      if (res.success && res.code && res.expiresAt) {
        setResult({ code: res.code, expiresAt: res.expiresAt, errors: res.errors ?? [] });
        incrementFiles();
        setToast(true);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setTick((n) => n + 1), 1000);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      } else {
        setErrors([res.message ?? "We couldn't upload your files. Please try again."]);
      }
    } catch {
      setErrors(["We couldn't connect. Please check your internet connection and try again."]);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* ignore */}
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setErrors([]);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const expired = result && Date.now() > result.expiresAt;

  return (
    <ToolPageShell
      backTo="/share"
      backLabel="Instant Share"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      }
      iconColor="#6f4e37"
      iconBg="#faf6f1"
      title="Share Files"
      description="Upload files or an entire folder. Get a 6-character code. All content is auto-deleted after 15 minutes."
    >
      {addedToast && <Toast message={addedToast} onClose={() => setAddedToast(null)} />}
      {toast && <Toast message="Files uploaded successfully!" onClose={() => setToast(false)} />}
      {!result ? (
        <>
          <div className={s.card}>
            <div className={t.limitsRow}>
              <span className={t.limitChip}>Max {MAX_FILES} files</span>
              <span className={t.limitChip}>Max {MAX_TOTAL_MB} MB total</span>
              <span className={t.limitChip}>Max {MAX_PER_FILE_MB} MB per file</span>
            </div>

            {/* Drop zone */}
            <div
              className={`${t.dropZone} ${dragging ? t.dropZoneActive : ""}`}
              onDragEnter={() => setDragging(true)}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              aria-label="Drop files here or click to browse"
            >
              <svg className={t.dropZoneIcon} width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
              <span className={t.dropZoneTitle}>
                {dragging ? "Drop to upload" : "Drag & drop files here"}
              </span>
              <span className={t.dropZoneSub}>or click to browse</span>
              <span className={t.browseBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Browse Files
              </span>
            </div>

            <div className={t.orDivider}>or</div>

            {/* Folder upload */}
            <button
              className={s.secondaryBtn}
              onClick={() => folderInputRef.current?.click()}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Upload Folder
            </button>

            <input ref={fileInputRef}   type="file" multiple hidden onChange={onFileChange} />
            <input ref={folderInputRef} type="file" multiple hidden onChange={onFileChange}
              /* @ts-expect-error – webkitdirectory is non-standard */
              webkitdirectory="true"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className={s.card}>
              <div className={s.rowBetween}>
                <span className={s.label}>{files.length} file{files.length !== 1 ? "s" : ""} · {formatBytes(totalSize)}</span>
                <button className={s.ghostBtn} onClick={() => setFiles([])}>Clear all</button>
              </div>
              <div className={t.fileList}>
                {files.map((f, i) => (
                  <div key={i} className={t.fileItem}>
                    <span className={t.fileName}>{f.webkitRelativePath || f.name}</span>
                    <span className={t.fileSize}>{formatBytes(f.size)}</span>
                    <button className={t.fileRemove} onClick={() => removeFile(i)} aria-label="Remove file">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className={t.errorList}>
              {errors.map((e, i) => <span key={i} className={t.errorItem}>{e}</span>)}
            </div>
          )}

          {loading && (
            <ProgressBar value={progress} tone="amber" label="Uploading…" />
          )}

          <button
            ref={shareButtonRef}
            className={s.primaryBtn}
            onClick={upload}
            disabled={loading || files.length === 0}
          >
            {loading ? "Uploading…" : `Share ${files.length} File${files.length !== 1 ? "s" : ""}`}
          </button>
        </>
      ) : (
        <div className={t.successBox} ref={resultRef}>
          <span className={t.successTitle}>
            {expired ? "Link Expired" : "Files Ready to Share"}
          </span>
          <div className={t.codeDisplay}>{result.code}</div>
          <p className={t.successMeta}>
            {expired
              ? "This share has expired."
              : <>Expires in <span className={t.countdown}>{formatCountdown(result.expiresAt)}</span></>
            }
          </p>
          {result.errors.length > 0 && (
            <div className={t.errorList}>
              <span className={t.errorItem}>Some files were skipped:</span>
              {result.errors.map((e, i) => <span key={i} className={t.errorItem}>• {e}</span>)}
            </div>
          )}
          {!expired && (
            <button
              className={copied ? `${tp.btnSecondary} ${tp.btnCopied}` : tp.btnSecondary}
              onClick={copy}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
          )}
          <button className={t.shareAgainBtn} onClick={reset}>Share more files</button>
        </div>
      )}
    </ToolPageShell>
  );
};

export default ShareFiles;
