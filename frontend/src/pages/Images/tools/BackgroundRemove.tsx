import { useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./imageTools.module.css";
import ShareViaToolSnapy from "./ShareViaToolSnapy";
import { baseName, downloadBlob, formatBytes } from "./imageUtils";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z" />
    <path d="M14 3h7v7h-7z" opacity="0.4" />
    <path d="M14 14h7v7h-7z" />
    <path d="M3 14h7v7H3z" opacity="0.4" />
  </svg>
);

interface SourceState {
  file: File;
  url: string;
}

interface ResultState {
  blob: Blob;
  url: string;
  filename: string;
}

const BackgroundRemove = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (src) URL.revokeObjectURL(src.url);
    if (result) URL.revokeObjectURL(result.url);
    setSrc(null);
    setResult(null);
    setError("");
    setProgress(0);
  };

  const loadFile = (file: File) => {
    setError("");
    setResult(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (src) URL.revokeObjectURL(src.url);
    setSrc({ file, url: URL.createObjectURL(file) });
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const remove = async () => {
    if (!src) return;
    setBusy(true);
    setError("");
    setProgress(0);
    setStage("Preparing…");
    try {
      const blob = await removeBackground(src.file, {
        progress: (key, current, total) => {
          const pct = total ? Math.round((current / total) * 100) : 0;
          setProgress(pct);
          setStage(key.startsWith("fetch") ? "Loading model…" : "Removing background…");
        },
      });
      if (result) URL.revokeObjectURL(result.url);
      const filename = `${baseName(src.file.name)}-no-bg.png`;
      setResult({ blob, url: URL.createObjectURL(blob), filename });
    } catch {
      setError("Background removal failed. Please try a different image or check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const shareFile = async (): Promise<File> => {
    if (!result) throw new Error("No result");
    return new File([result.blob], result.filename, { type: "image/png" });
  };

  return (
    <ToolPageShell
      backTo="/images"
      backLabel="Image Tools"
      icon={<Icon />}
      iconColor="#7c3aed"
      iconBg="#f5f3ff"
      title="Background Remover"
      description="Erase the background from any photo automatically. Runs privately in your browser."
    >
      {!src ? (
        <div className={s.card}>
          <span className={s.cardTitle}>Upload Image</span>
          <div
            className={`${ls.dropzone} ${dragOver ? ls.dropzoneActive : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click(); }}
          >
            <svg className={ls.dropIcon} width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className={ls.dropTitle}>Click to upload or drag &amp; drop</span>
            <span className={ls.dropHint}>PNG, JPG, WebP — a subject with a clear background works best</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className={ls.hiddenInput}
            onChange={onPick}
          />
          {error && <p className={ls.errorMsg}>{error}</p>}
        </div>
      ) : (
        <div className={s.card}>
          <div className={ls.fileInfo}>
            <div className={ls.fileMeta}>
              <span className={ls.fileName}>{src.file.name}</span>
              <span className={ls.fileSize}>{formatBytes(src.file.size)}</span>
            </div>
            <button type="button" className={ls.resetBtn} onClick={reset}>
              Change image
            </button>
          </div>

          {!result && (
            <div className={ls.comparison}>
              <div className={ls.compareCol}>
                <span className={ls.compareLabel}>Original</span>
                <div className={busy ? ls.scanWrap : undefined}>
                  <img src={src.url} alt="Original" className={ls.preview} />
                </div>
              </div>
            </div>
          )}

          {busy ? (
            <div className={ls.processing}>
              <ProgressBar value={progress} tone="purple" label={stage || "Working…"} />
              <span className={ls.dropHint}>First run downloads the AI model (one time).</span>
            </div>
          ) : (
            !result && (
              <button type="button" className={s.calcBtn} onClick={remove}>
                Remove Background
              </button>
            )
          )}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <span className={ls.successMsg} role="status">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Background removed!
              </span>

              <div className={ls.comparison}>
                <div className={ls.compareCol}>
                  <span className={ls.compareLabel}>Original</span>
                  <img src={src.url} alt="Original" className={ls.preview} />
                </div>
                <div className={ls.compareCol}>
                  <span className={ls.compareLabel}>Result</span>
                  <img src={result.url} alt="Background removed" className={ls.preview} />
                </div>
              </div>

              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={`${s.calcBtn} ${ls.dlBtn}`}
                  onClick={() => downloadBlob(result.blob, result.filename)}
                >
                  Download PNG
                </button>
                <button type="button" className={ls.uploadMoreBtn} onClick={reset}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload more
                </button>
                <ShareViaToolSnapy getFile={shareFile} />
              </div>
            </>
          )}
        </div>
      )}
    </ToolPageShell>
  );
};

export default BackgroundRemove;
