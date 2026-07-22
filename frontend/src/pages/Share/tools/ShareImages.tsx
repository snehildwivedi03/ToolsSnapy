/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
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
import { shareFiles, deleteShare } from "../../../services/shareApi";
import { incrementFiles } from "../../../services/shareCounter";
import { usePasteImage } from "../../../hooks/usePasteImage";

const ALLOWED_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILES = 50;
const MAX_PER_FILE_MB = 10;
const MAX_TOTAL_MB = 250;

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

const ShareImages = () => {
  const [files,    setFiles]    = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors,   setErrors]   = useState<string[]>([]);
  const [result,   setResult]   = useState<{ code: string; expiresAt: number; errors: string[] } | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [toast,    setToast]    = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [,         setTick]     = useState(0);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const resultRef     = useRef<HTMLDivElement>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const addFiles = useCallback((incoming: File[]) => {
    setErrors([]);
    const clientErrors: string[] = [];
    const valid = incoming.filter((f) => {
      const ext = "." + f.name.split(".").pop()!.toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        clientErrors.push(`${f.name}: only PNG, JPG, JPEG, WEBP allowed.`);
        return false;
      }
      if (f.size > MAX_PER_FILE_MB * 1024 * 1024) {
        clientErrors.push(`${f.name}: exceeds ${MAX_PER_FILE_MB} MB.`);
        return false;
      }
      return true;
    });

    setFiles((prev) => {
      const combined = [...prev, ...valid];
      const totalSize = combined.reduce((a, f) => a + f.size, 0);
      if (combined.length > MAX_FILES) { clientErrors.push(`Maximum ${MAX_FILES} images.`); return prev; }
      if (totalSize > MAX_TOTAL_MB * 1024 * 1024) { clientErrors.push(`Total exceeds ${MAX_TOTAL_MB} MB.`); return prev; }
      return combined;
    });
    if (clientErrors.length) setErrors(clientErrors);
    if (valid.length > 0) {
      setAddedToast(`${valid.length} image${valid.length !== 1 ? "s" : ""} selected`);
      setTimeout(() => shareButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
    }
  }, []);

  // Paste image(s) from the clipboard (Ctrl/Cmd+V) to add them.
  usePasteImage((files) => addFiles(files), !result);

  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files) { addFiles(Array.from(e.target.files)); e.target.value = ""; } };
  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const upload = async () => {
    if (!files.length) return;
    setErrors([]);
    setLoading(true);
    setProgress(0);
    try {
      const res = await shareFiles(files, "images", undefined, setProgress);
      setProgress(100);
      if (res.success && res.code && res.expiresAt) {
        setResult({ code: res.code, expiresAt: res.expiresAt, errors: res.errors ?? [] });
        incrementFiles();
        setToast(true);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setTick((n) => n + 1), 1000);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      } else { setErrors([res.message ?? "We couldn't upload your images. Please try again."]); }
    } catch { setErrors(["We couldn't connect. Please check your internet connection and try again."]); }
    finally { setLoading(false); setProgress(0); }
  };

  const copy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch {/* ignore */}
  };

  const reset = () => { setFiles([]); setResult(null); setErrors([]); if (timerRef.current) clearInterval(timerRef.current); };

  const handleDelete = async () => {
    if (!result) return;
    setDeleting(true);
    try {
      await deleteShare(result.code);
      if (timerRef.current) clearInterval(timerRef.current);
      reset();
      setAddedToast("Share deleted successfully.");
    } catch {
      setErrors(["We couldn't delete this share. Please try again."]);
    } finally {
      setDeleting(false);
    }
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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      }
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Share Images"
      description="Upload PNG, JPG, JPEG or WEBP images. Up to 50 images, 10 MB each, 250 MB total. Expires in 15 minutes."
    >
      {addedToast && <Toast message={addedToast} onClose={() => setAddedToast(null)} />}
      {toast && <Toast message="Images uploaded successfully!" onClose={() => setToast(false)} />}
      {!result ? (
        <>
          <div className={s.card}>
            <div className={t.limitsRow}>
              <span className={t.limitChip}>PNG · JPG · JPEG · WEBP</span>
              <span className={t.limitChip}>Max {MAX_FILES} images</span>
              <span className={t.limitChip}>Max {MAX_PER_FILE_MB} MB each</span>
              <span className={t.limitChip}>Max {MAX_TOTAL_MB} MB total</span>
            </div>

            <div
              className={`${t.dropZone} ${dragging ? t.dropZoneActive : ""}`}
              onDragEnter={() => setDragging(true)}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              aria-label="Drop images here or click to browse"
            >
              <svg className={t.dropZoneIcon} width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span className={t.dropZoneTitle}>{dragging ? "Drop images here" : "Drag & drop images"}</span>
              <span className={t.dropZoneSub}>PNG, JPG, JPEG, WEBP or click to browse</span>
              <span className={t.browseBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Images</span>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp" hidden onChange={onFileChange} />
          </div>

          {files.length > 0 && (
            <div className={s.card}>
              <div className={s.rowBetween}>
                <span className={s.label}>{files.length} image{files.length !== 1 ? "s" : ""} · {formatBytes(totalSize)}</span>
                <button className={s.ghostBtn} onClick={() => setFiles([])}>Clear all</button>
              </div>
              <div className={t.fileList}>
                {files.map((f, i) => (
                  <div key={i} className={t.fileItem}>
                    <span className={t.fileName}>{f.name}</span>
                    <span className={t.fileSize}>{formatBytes(f.size)}</span>
                    <button className={t.fileRemove} onClick={() => removeFile(i)} aria-label="Remove">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

          <button ref={shareButtonRef} className={s.primaryBtn} onClick={upload} disabled={loading || files.length === 0}>
            {loading ? "Uploading…" : `Share ${files.length || ""} Image${files.length !== 1 ? "s" : ""}`}
          </button>
        </>
      ) : (
        <div className={t.successBox} ref={resultRef}>
          <span className={t.successTitle}>{expired ? "Link Expired" : "Images Ready to Share"}</span>
          <div className={t.codeDisplay}>{result.code}</div>
          <p className={t.successMeta}>
            {expired ? "This share has expired."
              : <>Expires in <span className={t.countdown}>{formatCountdown(result.expiresAt)}</span></>}
          </p>
          {result.errors.length > 0 && (
            <div className={t.errorList}>
              {result.errors.map((e, i) => <span key={i} className={t.errorItem}>• {e}</span>)}
            </div>
          )}
          {!expired && <button className={copied ? `${tp.btnSecondary} ${tp.btnCopied}` : tp.btnSecondary} onClick={copy}>{copied ? "Copied!" : "Copy Code"}</button>}
          {!expired && <button className={tp.btnDanger} onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete now"}</button>}
          <button className={t.shareAgainBtn} onClick={reset}>Share more images</button>
        </div>
      )}
    </ToolPageShell>
  );
};

export default ShareImages;
