/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useRef, useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import Toast from "../../../components/Toast/Toast";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./imageTools.module.css";
import ShareViaToolSnapy from "./ShareViaToolSnapy";
import ImageDownloadMenu from "./ImageDownloadMenu";
import { usePasteImage } from "../../../hooks/usePasteImage";
import {
  baseName,
  compressToTargetSize,
  formatBytes,
  loadImage,
} from "./imageUtils";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V15" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

interface SourceState {
  file: File;
  img: HTMLImageElement;
  url: string;
}

interface ResultState {
  blob: Blob;
  url: string;
  filename: string;
  scaled: boolean;
}

const ImageResize = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [targetValue, setTargetValue] = useState("200");
  const [unit, setUnit] = useState<"KB" | "MB">("KB");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (src) URL.revokeObjectURL(src.url);
    if (result) URL.revokeObjectURL(result.url);
    setSrc(null);
    setResult(null);
    setError("");
  };

  const loadFile = async (file: File) => {
    setError("");
    setResult(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      if (src) URL.revokeObjectURL(src.url);
      setSrc({ file, img, url });
    } catch {
      setError("Could not read that image. Try another file.");
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void loadFile(file);
    e.target.value = "";
  };

  // Paste an image from the clipboard (Ctrl/Cmd+V) while on the upload screen.
  usePasteImage((files) => {
    const file = files[0];
    if (file) void loadFile(file);
  }, !src);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void loadFile(file);
  };

  const resize = async () => {
    if (!src) return;
    const value = parseFloat(targetValue);
    if (!value || value <= 0) {
      setError("Enter a valid target size.");
      return;
    }
    const targetBytes = Math.round(value * (unit === "MB" ? 1024 * 1024 : 1024));
    if (targetBytes < 1024) {
      setError("Target size is too small. Use at least 1 KB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { blob, scaled } = await compressToTargetSize(src.img, targetBytes);
      if (result) URL.revokeObjectURL(result.url);
      const filename = `${baseName(src.file.name)}-${value}${unit.toLowerCase()}.jpg`;
      setResult({ blob, url: URL.createObjectURL(blob), filename, scaled });
      setToast(`Done. Output is exactly ${formatBytes(blob.size)}${scaled ? " (dimensions reduced to fit)" : ""}`);
    } catch {
      setError("Could not resize the image. Try a different target size.");
    } finally {
      setBusy(false);
    }
  };

  // Provide a clean JPEG (without padding) for sharing.
  const shareFile = async (): Promise<File> => {
    if (!result) throw new Error("No result");
    return new File([result.blob], result.filename, { type: "image/jpeg" });
  };

  return (
    <ToolPageShell
      backTo="/images"
      backLabel="Image Tools"
      icon={<Icon />}
      iconColor="#6f4e37"
      iconBg="#faf6f1"
      title="Resize to Target Size"
      description="Compress any image to an exact file size. Pick a size, and we hit it precisely."
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
            <span className={ls.dropHint}>PNG, JPG, WebP. Processed in your browser</span>
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
              <span className={ls.fileSize}>
                {src.img.naturalWidth} × {src.img.naturalHeight} · {formatBytes(src.file.size)}
              </span>
            </div>
            <button type="button" className={ls.resetBtn} onClick={reset}>
              Change image
            </button>
          </div>

          <div className={`${s.inputGroup} ${ls.targetGroup}`}>
            <label className={s.label} htmlFor="target-size">Target file size</label>
            <div className={ls.sizeRow}>
              <input
                id="target-size"
                type="number"
                inputMode="decimal"
                min={1}
                className={s.input}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="200"
              />
              <select
                className={`${s.select} ${ls.unitSelect}`}
                value={unit}
                onChange={(e) => setUnit(e.target.value as "KB" | "MB")}
                aria-label="Size unit"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className={s.calcBtn}
            onClick={resize}
            disabled={busy}
          >
            {busy ? "Resizing…" : "Resize Image"}
          </button>

          {busy && <ProgressBar tone="purple" label="Compressing to target size…" />}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <div className={ls.previewWrap}>
                <img src={result.url} alt="Resized result" className={ls.preview} />
              </div>

              <div className={ls.actionRow}>
                <ImageDownloadMenu
                  blob={result.blob}
                  baseFilename={baseName(result.filename)}
                  nativeType="image/jpeg"
                  formats={[
                    { type: "image/jpeg", ext: "jpg", label: "JPG · exact target size" },
                    { type: "image/png", ext: "png", label: "PNG · lossless" },
                    { type: "image/webp", ext: "webp", label: "WebP · smaller file" },
                  ]}
                />
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
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </ToolPageShell>
  );
};

export default ImageResize;
