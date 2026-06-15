import { useRef, useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./imageTools.module.css";
import ShareViaToolSnapy from "./ShareViaToolSnapy";
import {
  baseName,
  canvasToBlob,
  downloadBlob,
  drawToCanvas,
  formatBytes,
  loadImage,
} from "./imageUtils";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
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
  width: number;
  height: number;
}

const PRESETS = [25, 50, 75];

const ImageResizeDimensions = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lock, setLock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ratio = src ? src.img.naturalWidth / src.img.naturalHeight : 1;

  const reset = () => {
    if (src) URL.revokeObjectURL(src.url);
    if (result) URL.revokeObjectURL(result.url);
    setSrc(null);
    setResult(null);
    setError("");
    setWidth("");
    setHeight("");
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
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    } catch {
      setError("Could not read that image. Try another file.");
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void loadFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void loadFile(file);
  };

  const onWidthChange = (v: string) => {
    setWidth(v);
    setResult(null);
    const n = Number(v);
    if (lock && n > 0) setHeight(String(Math.round(n / ratio)));
  };

  const onHeightChange = (v: string) => {
    setHeight(v);
    setResult(null);
    const n = Number(v);
    if (lock && n > 0) setWidth(String(Math.round(n * ratio)));
  };

  const applyPreset = (pct: number) => {
    if (!src) return;
    setResult(null);
    setWidth(String(Math.round((src.img.naturalWidth * pct) / 100)));
    setHeight(String(Math.round((src.img.naturalHeight * pct) / 100)));
  };

  const resize = async () => {
    if (!src) return;
    const w = Math.round(Number(width));
    const h = Math.round(Number(height));
    if (!w || !h || w <= 0 || h <= 0) {
      setError("Enter a valid width and height.");
      return;
    }
    if (w > 12000 || h > 12000) {
      setError("Maximum dimension is 12000 px.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const isJpeg = src.file.type === "image/jpeg" || src.file.type === "image/jpg";
      const canvas = drawToCanvas(src.img, w, h);
      const blob = await canvasToBlob(
        canvas,
        isJpeg ? "image/jpeg" : "image/png",
        isJpeg ? 0.92 : undefined,
      );
      if (result) URL.revokeObjectURL(result.url);
      const ext = isJpeg ? "jpg" : "png";
      const filename = `${baseName(src.file.name)}-${w}x${h}.${ext}`;
      setResult({ blob, url: URL.createObjectURL(blob), filename, width: w, height: h });
    } catch {
      setError("Could not resize the image. Try different dimensions.");
    } finally {
      setBusy(false);
    }
  };

  const shareFile = async (): Promise<File> => {
    if (!result) throw new Error("No result");
    return new File([result.blob], result.filename, { type: result.blob.type });
  };

  return (
    <ToolPageShell
      backTo="/images"
      backLabel="Image Tools"
      icon={<Icon />}
      iconColor="#7c3aed"
      iconBg="#f5f3ff"
      title="Image Resizer"
      description="Resize an image to exact pixel dimensions, with optional aspect-ratio lock."
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
            <span className={ls.dropHint}>PNG, JPG, WebP — processed in your browser</span>
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

          <div className={s.inputGrid2}>
            <div className={s.inputGroup}>
              <label className={s.label} htmlFor="resize-w">Width (px)</label>
              <input
                id="resize-w" type="number" min={1} className={s.input}
                value={width} onChange={(e) => onWidthChange(e.target.value)}
              />
            </div>
            <div className={s.inputGroup}>
              <label className={s.label} htmlFor="resize-h">Height (px)</label>
              <input
                id="resize-h" type="number" min={1} className={s.input}
                value={height} onChange={(e) => onHeightChange(e.target.value)}
              />
            </div>
          </div>

          <label className={ls.lockRow}>
            <input
              type="checkbox"
              checked={lock}
              onChange={(e) => setLock(e.target.checked)}
            />
            Lock aspect ratio
          </label>

          <div className={ls.presetRow}>
            <span className={ls.presetLabel}>Scale</span>
            {PRESETS.map((p) => (
              <button key={p} type="button" className={ls.presetBtn} onClick={() => applyPreset(p)}>
                {p}%
              </button>
            ))}
            <button type="button" className={ls.presetBtn} onClick={() => applyPreset(100)}>
              Original
            </button>
          </div>

          <button type="button" className={s.calcBtn} onClick={resize} disabled={busy}>
            {busy ? "Resizing…" : "Resize Image"}
          </button>

          {busy && <ProgressBar tone="purple" label="Resizing image…" />}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <span className={ls.successMsg} role="status">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Resized to {result.width} × {result.height} · {formatBytes(result.blob.size)}
              </span>

              <div className={ls.previewWrap}>
                <img src={result.url} alt="Resized result" className={ls.preview} />
              </div>

              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={`${s.calcBtn} ${ls.dlBtn}`}
                  onClick={() => downloadBlob(result.blob, result.filename)}
                >
                  Download
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

export default ImageResizeDimensions;
