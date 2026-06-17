import { useMemo, useRef, useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./imageTools.module.css";
import ShareViaToolSnapy from "./ShareViaToolSnapy";
import {
  baseName,
  canvasToBlob,
  downloadBlob,
  formatBytes,
  loadImage,
} from "./imageUtils";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

type Format = "png" | "jpeg" | "webp" | "avif" | "svg";

interface FormatDef {
  value: Format;
  label: string;
  ext: string;
  mime: string;
  lossy: boolean;
  /** True when the output is built manually rather than via canvas.toBlob. */
  svg?: boolean;
}

const ALL_FORMATS: FormatDef[] = [
  { value: "png",  label: "PNG",  ext: "png",  mime: "image/png",     lossy: false },
  { value: "jpeg", label: "JPG",  ext: "jpg",  mime: "image/jpeg",    lossy: true  },
  { value: "webp", label: "WebP", ext: "webp", mime: "image/webp",    lossy: true  },
  { value: "avif", label: "AVIF", ext: "avif", mime: "image/avif",    lossy: true  },
  { value: "svg",  label: "SVG",  ext: "svg",  mime: "image/svg+xml", lossy: false, svg: true },
];

/** Detect whether the browser's canvas can actually encode a given MIME type. */
function canEncode(mime: string): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    return c.toDataURL(mime).startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

interface SourceState {
  file: File;
  img: HTMLImageElement;
  url: string;
}

interface ResultState {
  blob: Blob;
  url: string;
  filename: string;
}

const ImageConverter = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only offer formats this browser can actually produce (SVG is always built manually).
  const formats = useMemo(
    () => ALL_FORMATS.filter((f) => f.svg || canEncode(f.mime)),
    [],
  );
  const current = formats.find((f) => f.value === format) ?? formats[0];

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

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void loadFile(file);
  };

  const convert = async () => {
    if (!src) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = src.img.naturalWidth;
      canvas.height = src.img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      // JPEG has no transparency — fill white so it doesn't go black.
      if (current.value === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(src.img, 0, 0);

      let blob: Blob;
      if (current.svg) {
        // Embed the raster image inside an SVG container so it stays lossless.
        const dataUrl = canvas.toDataURL("image/png");
        const svg =
          `<svg xmlns="http://www.w3.org/2000/svg" ` +
          `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
          `width="${canvas.width}" height="${canvas.height}" ` +
          `viewBox="0 0 ${canvas.width} ${canvas.height}">` +
          `<image width="${canvas.width}" height="${canvas.height}" ` +
          `href="${dataUrl}" xlink:href="${dataUrl}" /></svg>`;
        blob = new Blob([svg], { type: "image/svg+xml" });
      } else {
        blob = await canvasToBlob(
          canvas,
          current.mime,
          current.lossy ? quality / 100 : undefined,
        );
      }
      if (result) URL.revokeObjectURL(result.url);
      const filename = `${baseName(src.file.name)}.${current.ext}`;
      setResult({ blob, url: URL.createObjectURL(blob), filename });
    } catch {
      setError("Could not convert the image. Try another format.");
    } finally {
      setBusy(false);
    }
  };

  const shareFile = async (): Promise<File> => {
    if (!result) throw new Error("No result");
    return new File([result.blob], result.filename, { type: current.mime });
  };

  return (
    <ToolPageShell
      backTo="/images"
      backLabel="Image Tools"
      icon={<Icon />}
      iconColor="#7c3aed"
      iconBg="#f5f3ff"
      title="Image Converter"
      description="Convert images between PNG, JPG, WebP, AVIF and SVG. Everything stays in your browser."
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
            <span className={ls.dropHint}>PNG, JPG, WebP, AVIF, SVG. Processed in your browser</span>
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

          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="convert-format">Convert to</label>
            <select
              id="convert-format"
              className={s.select}
              value={format}
              onChange={(e) => { setFormat(e.target.value as Format); setResult(null); }}
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {current.lossy && (
            <div className={s.inputGroup}>
              <label className={s.label} htmlFor="convert-quality">Quality: {quality}%</label>
              <input
                id="convert-quality"
                type="range"
                min={10}
                max={100}
                step={1}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </div>
          )}

          <button type="button" className={s.calcBtn} onClick={convert} disabled={busy}>
            {busy ? "Converting…" : `Convert to ${current.label}`}
          </button>

          {busy && <ProgressBar tone="purple" label={`Converting to ${current.label}…`} />}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <span className={ls.successMsg} role="status">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Converted to {current.label} · {formatBytes(result.blob.size)}
              </span>

              <div className={ls.previewWrap}>
                <img src={result.url} alt="Converted result" className={ls.preview} />
              </div>

              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={`${s.calcBtn} ${ls.dlBtn}`}
                  onClick={() => downloadBlob(result.blob, result.filename)}
                >
                  Download {current.label}
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

export default ImageConverter;
