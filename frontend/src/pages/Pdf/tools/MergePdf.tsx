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
import Toast from "../../../components/Toast/Toast";
import { downloadBlob, formatBytes, readArrayBuffer } from "./pdfUtils";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="13" height="13" rx="2" />
    <path d="M8 21h11a2 2 0 0 0 2-2V8" />
  </svg>
);

interface Item {
  id: string;
  file: File;
}

interface ResultState {
  blob: Blob;
  url: string;
  filename: string;
  pages: number;
}

const MergePdf = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setItems([]);
    setResult(null);
    setError("");
  };

  const addFiles = (fileList: FileList | File[]) => {
    setError("");
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url);
      return null;
    });
    const pdfs = Array.from(fileList).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (pdfs.length === 0) {
      setError("Please choose PDF files only.");
      return;
    }
    setItems((prev) => [
      ...prev,
      ...pdfs.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const move = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const merge = async () => {
    if (items.length < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const out = await PDFDocument.create();
      for (let i = 0; i < items.length; i++) {
        const bytes = await readArrayBuffer(items[i].file);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copied = await out.copyPages(doc, doc.getPageIndices());
        copied.forEach((p) => out.addPage(p));
        setProgress(Math.round(((i + 1) / items.length) * 100));
      }
      const mergedBytes = await out.save();
      const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
      if (result) URL.revokeObjectURL(result.url);
      const pageCount = out.getPageCount();
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        filename: "merged.pdf",
        pages: pageCount,
      });
      setDownloadToast(`Merged into one PDF: ${pageCount} pages · ${formatBytes(blob.size)}`);
    } catch {
      setError("Could not merge these PDFs. One of them may be corrupted or password-protected.");
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
      title="Merge PDF"
      description="Combine multiple PDFs into a single document. Drag to reorder, then merge. All in your browser."
      narrow
    >
      {downloadToast && <Toast message={downloadToast} onClose={() => setDownloadToast(null)} />}
      {items.length === 0 ? (
        <div className={s.card}>
          <span className={s.cardTitle}>Upload PDFs</span>
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
            <span className={ls.dropHint}>Select two or more PDF files, processed in your browser</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className={ls.hiddenInput}
            onChange={onPick}
          />
          {error && <p className={ls.errorMsg}>{error}</p>}
        </div>
      ) : (
        <div className={s.card}>
          <div className={ls.fileInfo}>
            <span className={s.cardTitle}>{items.length} PDF{items.length > 1 ? "s" : ""} to merge</span>
            <button type="button" className={ls.resetBtn} onClick={reset}>
              Clear all
            </button>
          </div>

          <div className={ls.fileList}>
            {items.map((it, i) => (
              <div key={it.id} className={ls.fileRow}>
                <span className={ls.fileIndex}>{i + 1}</span>
                <div className={ls.fileRowMeta}>
                  <span className={ls.fileRowName}>{it.file.name}</span>
                  <span className={ls.fileRowSize}>{formatBytes(it.file.size)}</span>
                </div>
                <div className={ls.fileRowActions}>
                  <button type="button" className={ls.iconBtn} onClick={() => move(i, -1)}
                    disabled={i === 0} aria-label="Move up">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button type="button" className={ls.iconBtn} onClick={() => move(i, 1)}
                    disabled={i === items.length - 1} aria-label="Move down">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button type="button" className={`${ls.iconBtn} ${ls.removeBtn}`} onClick={() => remove(it.id)}
                    aria-label="Remove">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className={ls.addMoreBtn} onClick={() => inputRef.current?.click()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add more PDFs
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className={ls.hiddenInput}
            onChange={onPick}
          />

          <button type="button" className={s.calcBtn} onClick={merge} disabled={busy}>
            {busy ? (
              <>
                <span className={ls.spinner} aria-hidden="true" /> Merging…
              </>
            ) : (
              "Merge PDFs"
            )}
          </button>

          {busy && <ProgressBar value={progress} tone="purple" label="Merging PDFs…" />}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={`${s.calcBtn} ${ls.dlBtn}`}
                  onClick={() => { downloadBlob(result.blob, result.filename); setDownloadToast("Downloaded successfully!"); }}
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

export default MergePdf;
