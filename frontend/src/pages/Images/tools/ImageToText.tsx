/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useEffect, useRef, useState } from "react";
import { createWorker, OEM } from "tesseract.js";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import Toast from "../../../components/Toast/Toast";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import s from "../../../styles/calc.module.css";
import tp from "../../../styles/toolpage.module.css";
import ls from "./imageTools.module.css";
import { formatBytes, loadImage } from "./imageUtils";
import { usePasteImage } from "../../../hooks/usePasteImage";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

interface SourceState {
  file: File;
  img: HTMLImageElement;
  url: string;
}

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "hin", label: "Hindi" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "por", label: "Portuguese" },
  { value: "ita", label: "Italian" },
  { value: "rus", label: "Russian" },
  { value: "jpn", label: "Japanese" },
  { value: "kor", label: "Korean" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "ara", label: "Arabic" },
] as const;

const ImageToText = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (result) setToast("Text extracted successfully!");
  }, [result]);

  const reset = () => {
    if (src) URL.revokeObjectURL(src.url);
    setSrc(null);
    setResult("");
    setError("");
    setProgress(0);
    setStage("");
  };

  const loadFile = async (file: File) => {
    setError("");
    setResult("");
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

  const extractText = async () => {
    if (!src) return;
    setBusy(true);
    setError("");
    setResult("");
    setProgress(0);
    setStage("Initializing...");

    try {
      const worker = await createWorker(lang, OEM.LSTM_ONLY, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStage("Recognizing text...");
            setProgress(Math.round(m.progress * 100));
          } else if (m.status === "loading tesseract core") {
            setStage("Loading OCR engine...");
            setProgress(10);
          } else if (m.status === "initializing tesseract") {
            setStage("Initializing...");
            setProgress(20);
          } else if (m.status === "loading language traineddata") {
            setStage(`Loading ${LANGUAGES.find(l => l.value === lang)?.label || lang} language...`);
            setProgress(30);
          } else if (m.status === "initializing api") {
            setStage("Preparing...");
            setProgress(40);
          }
        },
      });

      const { data } = await worker.recognize(src.url);
      await worker.terminate();

      if (data.text.trim()) {
        setResult(data.text.trim());
      } else {
        setError("No text found in this image. Try a clearer image with visible text.");
      }
    } catch (err) {
      console.error("OCR error:", err);
      setError("Could not extract text. Please try again with a different image.");
    } finally {
      setBusy(false);
      setProgress(0);
      setStage("");
    }
  };

  const copyText = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadText = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = src ? `${src.file.name.replace(/\.[^/.]+$/, "")}-text.txt` : "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageShell
      backTo="/images"
      backLabel="Image Tools"
      icon={<Icon />}
      iconColor="#6f4e37"
      iconBg="#faf6f1"
      title="Image to Text (OCR)"
      description="Extract text from images using optical character recognition. Supports multiple languages. Runs privately in your browser."
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
            <span className={ls.dropHint}>PNG, JPG, WebP. Images with clear text work best</span>
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

          <div className={ls.previewWrap}>
            <img src={src.url} alt="Source" className={ls.preview} />
          </div>

          <div className={`${s.inputGroup} ${ls.narrowField}`}>
            <label className={s.label} htmlFor="ocr-language">Language</label>
            <select
              id="ocr-language"
              className={s.select}
              value={lang}
              onChange={(e) => { setLang(e.target.value); setResult(""); }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <button type="button" className={s.calcBtn} onClick={extractText} disabled={busy}>
            {busy ? "Extracting..." : "Extract Text"}
          </button>

          {busy && (
            <div className={ls.processing}>
              <ProgressBar value={progress} tone="purple" label={stage || "Processing..."} />
              <span className={ls.dropHint}>First run downloads the language model (one time).</span>
            </div>
          )}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <div className={s.inputGroup}>
                <label className={s.label}>Extracted Text</label>
                <textarea
                  className={s.textarea}
                  value={result}
                  readOnly
                  rows={10}
                  style={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                />
              </div>

              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={copied ? `${tp.btnSecondary} ${tp.btnCopied} ${ls.copyFixed}` : `${tp.btnSecondary} ${ls.copyFixed}`}
                  onClick={copyText}
                >
                  {copied ? "Copied!" : "Copy Text"}
                </button>
                <button
                  type="button"
                  className={ls.uploadMoreBtn}
                  onClick={downloadText}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download .txt
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
                <ShareTextViaToolSnapy getText={() => result} className={ls.shareBtn} />
              </div>
            </>
          )}
        </div>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </ToolPageShell>
  );
};

export default ImageToText;
