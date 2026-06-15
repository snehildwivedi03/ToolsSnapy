import { useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./pdfTools.module.css";
import { baseName, downloadBlob, formatBytes, readArrayBuffer } from "./pdfUtils";
import { canvasToBlob } from "../../Images/tools/imageUtils";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="10" cy="13" r="1.5" />
    <path d="M20 17l-3.5-3.5L9 21" />
  </svg>
);

type Format = "png" | "jpeg";

interface SourceState {
  file: File;
  bytes: Uint8Array;
  pages: number;
}

interface PageImage {
  blob: Blob;
  url: string;
  filename: string;
  label: string;
}

const PdfToImages = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [format, setFormat] = useState<Format>("png");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const [pages, setPages] = useState<PageImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearPages = () => {
    setPages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  };

  const reset = () => {
    clearPages();
    setSrc(null);
    setError("");
    setProgress({ current: 0, total: 0 });
  };

  const loadFile = async (file: File) => {
    setError("");
    clearPages();
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    try {
      const buf = await readArrayBuffer(file);
      const bytes = new Uint8Array(buf);
      const doc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
      setSrc({ file, bytes, pages: doc.numPages });
      await doc.destroy();
    } catch {
      setError("Could not read that PDF. It may be corrupted or password-protected.");
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
    clearPages();
    const ext = format === "png" ? "png" : "jpg";
    const mime = format === "png" ? "image/png" : "image/jpeg";
    try {
      const doc = await pdfjsLib.getDocument({ data: src.bytes.slice() }).promise;
      setProgress({ current: 0, total: doc.numPages });
      const out: PageImage[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported.");
        if (format === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await canvasToBlob(canvas, mime, format === "jpeg" ? 0.92 : undefined);
        out.push({
          blob,
          url: URL.createObjectURL(blob),
          filename: `${baseName(src.file.name)}-page-${i}.${ext}`,
          label: `Page ${i}`,
        });
        page.cleanup();
        setProgress({ current: i, total: doc.numPages });
      }
      await doc.destroy();
      setPages(out);
    } catch {
      setError("Could not convert this PDF to images. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = () => {
    pages.forEach((p, i) => {
      setTimeout(() => downloadBlob(p.blob, p.filename), i * 150);
    });
  };

  return (
    <ToolPageShell
      backTo="/pdf"
      backLabel="PDF Tools"
      icon={<Icon />}
      iconColor="#dc2626"
      iconBg="#fef2f2"
      title="PDF to Images"
      description="Convert each page of a PDF into a high-resolution PNG or JPG image. Everything runs in your browser."
    >
      {!src ? (
        <div className={s.card}>
          <span className={s.cardTitle}>Upload PDF</span>
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
            <span className={ls.dropHint}>A single PDF — processed in your browser</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
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
              <span className={ls.fileSize}>{src.pages} pages · {formatBytes(src.file.size)}</span>
            </div>
            <button type="button" className={ls.resetBtn} onClick={reset}>
              Change PDF
            </button>
          </div>

          <div className={ls.formatRow}>
            <span className={ls.formatLabel}>Format</span>
            <button
              type="button"
              className={`${ls.formatBtn} ${format === "png" ? ls.formatBtnActive : ""}`}
              onClick={() => { setFormat("png"); clearPages(); }}
            >
              PNG
            </button>
            <button
              type="button"
              className={`${ls.formatBtn} ${format === "jpeg" ? ls.formatBtnActive : ""}`}
              onClick={() => { setFormat("jpeg"); clearPages(); }}
            >
              JPG
            </button>
          </div>

          <button type="button" className={s.calcBtn} onClick={convert} disabled={busy}>
            {busy ? (
              <>
                <span className={ls.spinner} aria-hidden="true" /> Converting…
              </>
            ) : (
              "Convert to Images"
            )}
          </button>

          {busy && progress.total > 0 && (
            <div className={ls.processing}>
              <ProgressBar
                value={(progress.current / progress.total) * 100}
                tone="red"
                label={`Rendering page ${progress.current} of ${progress.total}…`}
              />
            </div>
          )}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {pages.length > 0 && (
            <>
              <div className={ls.actionRow}>
                <button type="button" className={`${s.calcBtn} ${ls.dlBtn}`} onClick={downloadAll}>
                  Download all ({pages.length})
                </button>
                <button type="button" className={ls.uploadMoreBtn} onClick={reset}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Start over
                </button>
              </div>

              <div className={ls.pageGrid}>
                {pages.map((p) => (
                  <div key={p.filename} className={ls.pageThumb}>
                    <img src={p.url} alt={p.label} className={ls.pageThumbImg} />
                    <div className={ls.pageThumbBar}>
                      <span className={ls.pageThumbLabel}>{p.label}</span>
                      <button
                        type="button"
                        className={ls.pageThumbDl}
                        onClick={() => downloadBlob(p.blob, p.filename)}
                        aria-label={`Download ${p.label}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </ToolPageShell>
  );
};

export default PdfToImages;
