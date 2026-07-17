import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { PDFDocument } from "pdf-lib";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import Toast from "../../../components/Toast/Toast";
import s from "../../../styles/calc.module.css";
import ls from "./pdfTools.module.css";
import im from "../../Images/tools/imageTools.module.css";
import ShareViaToolSnapy from "../../Images/tools/ShareViaToolSnapy";
import { baseName, downloadBlob, formatBytes } from "./pdfUtils";
import { canvasToBlob } from "../../Images/tools/imageUtils";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// ── helpers ──────────────────────────────────────────────────────────────────

/** Render every page of the loaded pdf document to a canvas at `scale`. */
async function renderAllPages(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  scale: number,
  onPage: (done: number, total: number) => void,
): Promise<HTMLCanvasElement[]> {
  const canvases: HTMLCanvasElement[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported.");
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    canvases.push(canvas);
    onPage(i, pdfDoc.numPages);
  }
  return canvases;
}

/** Encode canvases as JPEGs at `quality` and compose them into a new PDF. */
async function composePdf(canvases: HTMLCanvasElement[], quality: number): Promise<Blob> {
  const pdfOut = await PDFDocument.create();
  for (const canvas of canvases) {
    const jpegBlob = await canvasToBlob(canvas, "image/jpeg", quality);
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const img = await pdfOut.embedJpg(jpegBytes);
    const page = pdfOut.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await pdfOut.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * Try to produce a PDF whose byte count is ≤ targetBytes.
 * Tries scales [1.0, 0.75, 0.5]. Progress spans 0→100% across all
 * attempts so the bar completes exactly once.
 */
async function compressPdfToTargetSize(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  targetBytes: number,
  setLabel: (msg: string) => void,
  setProgress: (pct: number) => void,
): Promise<{ blob: Blob; scaled: boolean }> {
  const scales = [1.0, 0.75, 0.5] as const;
  const totalPhases = scales.length * 2; // render phase + quality phase per scale
  let fallback: { blob: Blob; scaled: boolean } | null = null;

  for (let si = 0; si < scales.length; si++) {
    const scale = scales[si]!;
    const scaled = scale < 1.0;

    // Per-scale progress windows — bar travels 0→100% exactly once overall
    const renderStart = Math.round((si * 2 / totalPhases) * 100);
    const renderEnd   = Math.round(((si * 2 + 1) / totalPhases) * 100);
    const qualStart   = renderEnd;
    const qualEnd     = Math.round(((si * 2 + 2) / totalPhases) * 100);

    // ── 1. Render all pages at this scale ──────────────────
    setProgress(renderStart);
    const canvases = await renderAllPages(pdfDoc, scale, (done, total) => {
      setLabel(`Rendering page ${done} / ${total}…`);
      setProgress(renderStart + Math.round((done / total) * (renderEnd - renderStart)));
    });

    // ── 2. Binary-search JPEG quality ──────────────────────
    let lo = 0.05;
    let hi = 0.95;
    let bestBlob: Blob | null = null;

    for (let iter = 0; iter < 8; iter++) {
      const mid = (lo + hi) / 2;
      setLabel(`Optimising quality (${Math.round(mid * 100)}%)…`);
      setProgress(qualStart + Math.round((iter / 8) * (qualEnd - qualStart)));

      const blob = await composePdf(canvases, mid);
      if (blob.size <= targetBytes) {
        bestBlob = blob;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    if (bestBlob) return { blob: bestBlob, scaled };

    // Keep the smallest result as fallback (lowest quality at this scale)
    const smallestBlob = await composePdf(canvases, 0.05);
    if (!fallback || smallestBlob.size < fallback.blob.size) {
      fallback = { blob: smallestBlob, scaled };
    }
  }

  // Nothing hit the target — return the smallest we achieved
  return fallback ?? { blob: await composePdf([], 0.05), scaled: true };
}

// ── icon ─────────────────────────────────────────────────────────────────────

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="8 13 10 15 16 9" />
  </svg>
);

// ── types ─────────────────────────────────────────────────────────────────────

interface SourceState {
  file: File;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
}

interface ResultState {
  blob: Blob;
  filename: string;
  scaled: boolean;
}

// ── component ─────────────────────────────────────────────────────────────────

const PdfResize = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [targetValue, setTargetValue] = useState("500");
  const [unit, setUnit] = useState<"KB" | "MB">("KB");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [minSize, setMinSize] = useState<number | null>(null);
  const [computingMin, setComputingMin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [progressPct, setProgressPct] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute minimum achievable size whenever the loaded PDF changes
  useEffect(() => {
    if (!src) { setMinSize(null); setComputingMin(false); return; }
    let cancelled = false;
    setMinSize(null);
    setComputingMin(true);
    async function run() {
      try {
        const canvases = await renderAllPages(src!.pdfDoc, 0.5, () => {});
        const blob = await composePdf(canvases, 0.05);
        if (!cancelled) { setMinSize(blob.size); setComputingMin(false); }
      } catch {
        if (!cancelled) setComputingMin(false);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [src]);

  const reset = () => {
    setSrc(null);
    setResult(null);
    setError("");
  };

  const loadFile = async (file: File) => {
    setError("");
    setResult(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a valid PDF file.");
      return;
    }
    setLoadingPdf(true);
    try {
      const ab = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(ab) }).promise;
      setSrc({ file, pdfDoc });
    } catch {
      setError("Could not read that PDF. Try another file.");
    } finally {
      setLoadingPdf(false);
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

  const compress = async () => {
    if (!src) return;
    const value = parseFloat(targetValue);
    if (!value || value <= 0) { setError("Enter a valid target size."); return; }
    const targetBytes = Math.round(value * (unit === "MB" ? 1024 * 1024 : 1024));
    if (targetBytes < 10 * 1024) { setError("Target size is too small. Use at least 10 KB."); return; }
    if (targetBytes >= src.file.size) {
      setError("Target size is larger than the original. No compression needed.");
      return;
    }
    if (minSize !== null && targetBytes < minSize) {
      setError(`Target too small — minimum achievable size for this PDF is ~${formatBytes(minSize)}.`);
      return;
    }

    setBusy(true);
    setError("");
    setProgressLabel("Starting…");
    setProgressPct(undefined);

    try {
      const { blob, scaled } = await compressPdfToTargetSize(
        src.pdfDoc,
        targetBytes,
        setProgressLabel,
        setProgressPct,
      );
      const filename = `${baseName(src.file.name)}-${value}${unit.toLowerCase()}.pdf`;
      setResult({ blob, filename, scaled });
      const hit = blob.size <= targetBytes;
      setDownloadToast(
        hit
          ? `Done. Output is ${formatBytes(blob.size)}${scaled ? " (scale reduced to fit)" : ""}`
          : `Best result: ${formatBytes(blob.size)} — target was too small to reach`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed. Try a larger target size.");
    } finally {
      setBusy(false);
      setProgressLabel("");
      setProgressPct(undefined);
    }
  };

  const shareFile = async (): Promise<File> => {
    if (!result) throw new Error("No result");
    return new File([result.blob], result.filename, { type: "application/pdf" });
  };

  const enteredBytes = (() => {
    const tv = parseFloat(targetValue);
    return tv > 0 ? Math.round(tv * (unit === "MB" ? 1024 * 1024 : 1024)) : 0;
  })();
  const targetTooSmall = minSize !== null && !computingMin && enteredBytes > 0 && enteredBytes < minSize;

  return (
    <ToolPageShell
      backTo="/pdf"
      backLabel="PDF Tools"
      icon={<Icon />}
      iconColor="#dc2626"
      iconBg="#fef2f2"
      title="Resize PDF to Target Size"
      description="Compress a PDF to an exact file size. Pages are rasterised to images so text won't be selectable in the output."
      narrow
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
            <span className={ls.dropHint}>PDF only · Processed entirely in your browser</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className={ls.hiddenInput}
            onChange={onPick}
          />
          {loadingPdf && <ProgressBar tone="red" label="Reading PDF…" />}
          {error && <p className={im.errorMsg}>{error}</p>}
        </div>
      ) : (
        <div className={s.card}>
          <div className={ls.fileInfo}>
            <div className={ls.fileMeta}>
              <span className={ls.fileName}>{src.file.name}</span>
              <span className={ls.fileSize}>
                {src.pdfDoc.numPages} page{src.pdfDoc.numPages !== 1 ? "s" : ""} · {formatBytes(src.file.size)}
              </span>
            </div>
            <button type="button" className={ls.resetBtn} onClick={reset}>
              Change file
            </button>
          </div>

          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="pdf-target-size">Target file size</label>
            <div className={im.sizeRow}>
              <input
                id="pdf-target-size"
                type="number"
                inputMode="decimal"
                min={10}
                className={s.input}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="500"
              />
              <select
                className={`${s.select} ${im.unitSelect}`}
                value={unit}
                onChange={(e) => setUnit(e.target.value as "KB" | "MB")}
                aria-label="Size unit"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
              </select>
            </div>
          </div>

          {computingMin && (
            <p className={ls.hintText}>Calculating minimum achievable size…</p>
          )}
          {!computingMin && minSize !== null && (
            <p className={ls.hintText}>Minimum achievable: ~{formatBytes(minSize)}</p>
          )}
          {targetTooSmall && (
            <p className={im.errorMsg}>Too small — minimum achievable is ~{formatBytes(minSize!)}</p>
          )}

          {busy && (
            <ProgressBar
              tone="red"
              value={progressPct}
              label={progressLabel}
            />
          )}

          <button
            type="button"
            className={s.calcBtn}
            onClick={compress}
            disabled={busy}
          >
            {busy ? "Compressing…" : "Compress PDF"}
          </button>

          {error && <p className={im.errorMsg}>{error}</p>}

          {result && (
            <>
              <div className={im.actionRow}>
                <button
                  type="button"
                  className={im.uploadMoreBtn}
                  onClick={() => { downloadBlob(result.blob, result.filename); setDownloadToast("Downloaded successfully!"); }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </button>
                <button type="button" className={im.uploadMoreBtn} onClick={reset}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload new file
                </button>
                <ShareViaToolSnapy getFile={shareFile} />
              </div>
            </>
          )}
        </div>
      )}
      {downloadToast && <Toast message={downloadToast} onClose={() => setDownloadToast(null)} />}
    </ToolPageShell>
  );
};

export default PdfResize;
