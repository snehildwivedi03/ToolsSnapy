/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./pdfTools.module.css";
import ShareViaToolSnapy from "../../Images/tools/ShareViaToolSnapy";
import Toast, { type ToastVariant } from "../../../components/Toast/Toast";
import {
  baseName,
  downloadBlob,
  formatBytes,
  readArrayBuffer,
} from "./pdfUtils";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

interface SourceState {
  file: File;
  bytes: ArrayBuffer;
  pages: number;
}

interface ResultState {
  blob: Blob;
  url: string;
  filename: string;
  pageCount: number;
}

const SplitPdf = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [fromPage, setFromPage] = useState("");
  const [toPage, setToPage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setSrc(null);
    setResult(null);
    setFromPage("");
    setToPage("");
    setError("");
  };

  const loadFile = async (file: File) => {
    setError("");
    setResult(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    try {
      const bytes = await readArrayBuffer(file);
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pageCount = doc.getPageCount();
      setSrc({ file, bytes, pages: pageCount });
      setFromPage("1");
      setToPage(String(pageCount));
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

  /* Show an immediate error popup as soon as the typed range is invalid. */
  const validateRange = (fromStr: string, toStr: string, total: number) => {
    const from = Number.parseInt(fromStr, 10);
    const to = Number.parseInt(toStr, 10);
    if (!Number.isFinite(from) || !Number.isFinite(to)) return;
    if (from < 1 || to > total) {
      setToast({ message: `Pages must be between 1 and ${total}.`, variant: "error" });
    } else if (from > to) {
      setToast({
        message: `Start page (${from}) can't be greater than end page (${to}).`,
        variant: "error",
      });
    }
  };

  const extract = async () => {
    if (!src) return;
    const from = Number.parseInt(fromPage, 10);
    const to = Number.parseInt(toPage, 10);
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      setToast({ message: "Enter a start and end page.", variant: "error" });
      return;
    }
    if (from < 1 || to > src.pages) {
      setToast({ message: `Pages must be between 1 and ${src.pages}.`, variant: "error" });
      return;
    }
    if (from > to) {
      setToast({
        message: `Start page (${from}) can't be greater than end page (${to}).`,
        variant: "error",
      });
      return;
    }
    const indices: number[] = [];
    for (let p = from; p <= to; p++) indices.push(p - 1);
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.load(src.bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(doc, indices);
      copied.forEach((p) => out.addPage(p));
      const outBytes = await out.save();
      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      if (result) URL.revokeObjectURL(result.url);
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        filename: `${baseName(src.file.name)}-pages.pdf`,
        pageCount: indices.length,
      });
      setToast({
        message: `Extracted ${indices.length} page${indices.length > 1 ? "s" : ""} · ${formatBytes(blob.size)}`,
        variant: "success",
      });
    } catch {
      setError("Could not extract those pages. Try a different range.");
    } finally {
      setBusy(false);
    }
  };

  const shareFile = async (): Promise<File> => {
    if (!result) throw new Error("No result");
    return new File([result.blob], result.filename, { type: "application/pdf" });
  };

  return (
    <ToolPageShell
      backTo="/pdf"
      backLabel="PDF Tools"
      icon={<Icon />}
      iconColor="#dc2626"
      iconBg="#fef2f2"
      title="Split & Extract PDF"
      description="Pull out the pages you need into a new PDF. Enter page numbers or ranges like 1-3, 5, 8-10."
      narrow
    >
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
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
            <span className={ls.dropHint}>A single PDF, processed in your browser</span>
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

          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="page-from">Pages to extract</label>
            <div className={ls.rangeRow}>
              <input
                id="page-from"
                type="number"
                inputMode="numeric"
                min={1}
                max={src.pages}
                className={`${s.input} ${ls.rangeInput}`}
                value={fromPage}
                onChange={(e) => { const v = e.target.value; setFromPage(v); setError(""); if (src) validateRange(v, toPage, src.pages); }}
                placeholder="1"
                aria-label="From page"
              />
              <span className={ls.rangeDash}>to</span>
              <input
                id="page-to"
                type="number"
                inputMode="numeric"
                min={1}
                max={src.pages}
                className={`${s.input} ${ls.rangeInput}`}
                value={toPage}
                onChange={(e) => { const v = e.target.value; setToPage(v); setError(""); if (src) validateRange(fromPage, v, src.pages); }}
                placeholder={String(src.pages)}
                aria-label="To page"
              />
            </div>
            <p className={ls.hintText}>
              Enter a start and end page. Use the same number in both boxes to extract a single page. This PDF has {src.pages} page{src.pages > 1 ? "s" : ""}.
            </p>
          </div>

          <button type="button" className={s.calcBtn} onClick={extract} disabled={busy}>
            {busy ? (
              <>
                <span className={ls.spinner} aria-hidden="true" /> Extracting…
              </>
            ) : (
              "Extract Pages"
            )}
          </button>

          {busy && <ProgressBar tone="purple" label="Extracting pages…" />}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={`${s.calcBtn} ${ls.dlBtn}`}
                  onClick={() => { downloadBlob(result.blob, result.filename); setToast({ message: "Downloaded successfully!", variant: "success" }); }}
                >
                  Download PDF
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
                <ShareViaToolSnapy getFile={shareFile} kind="pdfs" />
              </div>
            </>
          )}
        </div>
      )}
    </ToolPageShell>
  );
};

export default SplitPdf;
