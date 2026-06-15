import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./pdfTools.module.css";
import ShareViaToolSnapy from "../../Images/tools/ShareViaToolSnapy";
import {
  baseName,
  downloadBlob,
  formatBytes,
  parsePageSelection,
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
  const [selection, setSelection] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setSrc(null);
    setResult(null);
    setSelection("");
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
      setSrc({ file, bytes, pages: doc.getPageCount() });
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

  const extract = async () => {
    if (!src) return;
    let indices: number[];
    try {
      indices = parsePageSelection(selection, src.pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid page selection.");
      return;
    }
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
    } catch {
      setError("Could not extract those pages. Try a different selection.");
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

          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="page-selection">Pages to extract</label>
            <input
              id="page-selection"
              type="text"
              className={s.input}
              value={selection}
              onChange={(e) => setSelection(e.target.value)}
              placeholder={`e.g. 1-3, 5, 8-${src.pages}`}
            />
            <p className={ls.hintText}>
              Use commas for individual pages and hyphens for ranges. This PDF has {src.pages} page{src.pages > 1 ? "s" : ""}.
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

          {busy && <ProgressBar tone="red" label="Extracting pages…" />}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <span className={ls.successMsg} role="status">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Extracted {result.pageCount} page{result.pageCount > 1 ? "s" : ""} · {formatBytes(result.blob.size)}
              </span>

              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={`${s.calcBtn} ${ls.dlBtn}`}
                  onClick={() => downloadBlob(result.blob, result.filename)}
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
