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
import { canvasToBlob, drawToCanvas, loadImage } from "../../Images/tools/imageUtils";
import { usePasteImage } from "../../../hooks/usePasteImage";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

interface Item {
  id: string;
  file: File;
  url: string;
}

interface ResultState {
  blob: Blob;
  url: string;
  filename: string;
  pages: number;
}

/** Get PNG/JPEG bytes for embedding; convert unsupported formats via canvas. */
async function getEmbeddableBytes(
  file: File,
): Promise<{ bytes: ArrayBuffer; kind: "jpg" | "png" }> {
  const type = file.type.toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg") {
    return { bytes: await readArrayBuffer(file), kind: "jpg" };
  }
  if (type === "image/png") {
    return { bytes: await readArrayBuffer(file), kind: "png" };
  }
  // WebP / AVIF / others → render to a PNG canvas first.
  const img = await loadImage(file);
  const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight);
  const blob = await canvasToBlob(canvas, "image/png");
  return { bytes: await blob.arrayBuffer(), kind: "png" };
}

const ImagesToPdf = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    items.forEach((it) => URL.revokeObjectURL(it.url));
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
    const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      setError("Please choose image files (JPG, PNG, WebP).");
      return;
    }
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  // Paste image(s) from the clipboard (Ctrl/Cmd+V) to add them.
  usePasteImage((files) => addFiles(files));

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
    setItems((prev) => {
      const found = prev.find((it) => it.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((it) => it.id !== id);
    });
  };

  const build = async () => {
    if (items.length === 0) return;
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const pdf = await PDFDocument.create();
      for (let i = 0; i < items.length; i++) {
        const { bytes, kind } = await getEmbeddableBytes(items[i].file);
        const embedded =
          kind === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
        const page = pdf.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: embedded.width,
          height: embedded.height,
        });
        setProgress(Math.round(((i + 1) / items.length) * 100));
      }
      const outBytes = await pdf.save();
      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      if (result) URL.revokeObjectURL(result.url);
      const pageCount = pdf.getPageCount();
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        filename: "images.pdf",
        pages: pageCount,
      });
      setDownloadToast(`PDF ready: ${pageCount} page${pageCount > 1 ? "s" : ""} · ${formatBytes(blob.size)}`);
    } catch {
      setError("Could not build the PDF. One of the images may be unsupported.");
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
      title="Images to PDF"
      description="Turn JPG, PNG or WebP images into a single PDF, one image per page. Drag to reorder."
      narrow
    >
      {downloadToast && <Toast message={downloadToast} onClose={() => setDownloadToast(null)} />}
      {items.length === 0 ? (
        <div className={s.card}>
          <span className={s.cardTitle}>Upload Images</span>
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
            <span className={ls.dropHint}>JPG, PNG, WebP. One image per page, processed in your browser</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className={ls.hiddenInput}
            onChange={onPick}
          />
          {error && <p className={ls.errorMsg}>{error}</p>}
        </div>
      ) : (
        <div className={s.card}>
          <div className={ls.fileInfo}>
            <span className={s.cardTitle}>{items.length} image{items.length > 1 ? "s" : ""}</span>
            <button type="button" className={ls.resetBtn} onClick={reset}>
              Clear all
            </button>
          </div>

          <div className={ls.fileList}>
            {items.map((it, i) => (
              <div key={it.id} className={ls.fileRow}>
                <span className={ls.fileIndex}>{i + 1}</span>
                <img src={it.url} alt="" className={ls.fileThumb} />
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
            Add more images
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className={ls.hiddenInput}
            onChange={onPick}
          />

          <button type="button" className={s.calcBtn} onClick={build} disabled={busy}>
            {busy ? (
              <>
                <span className={ls.spinner} aria-hidden="true" /> Building PDF…
              </>
            ) : (
              "Create PDF"
            )}
          </button>

          {busy && <ProgressBar value={progress} tone="purple" label="Building PDF…" />}

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

export default ImagesToPdf;
