import { useRef, useState, useEffect, useCallback } from "react";
import { removeBackground } from "@imgly/background-removal";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./imageTools.module.css";
import ShareViaToolSnapy from "./ShareViaToolSnapy";
import ImageDownloadMenu from "./ImageDownloadMenu";
import { baseName, formatBytes, loadImage } from "./imageUtils";

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z" />
    <path d="M14 3h7v7h-7z" opacity="0.4" />
    <path d="M14 14h7v7h-7z" />
    <path d="M3 14h7v7H3z" opacity="0.4" />
  </svg>
);

interface SourceState {
  file: File;
  url: string;
}

interface ResultState {
  blob: Blob;
  url: string;
  filename: string;
}

type EditTool = "none" | "eraser" | "restore";

const BackgroundRemove = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Canvas editing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImgRef, setOriginalImgRef] = useState<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<EditTool>("none");
  const [brushSize, setBrushSize] = useState(20);
  const [isPainting, setIsPainting] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const reset = () => {
    if (src) URL.revokeObjectURL(src.url);
    if (result) URL.revokeObjectURL(result.url);
    setSrc(null);
    setResult(null);
    setError("");
    setProgress(0);
    setActiveTool("none");
    setOriginalImgRef(null);
  };

  const loadFile = (file: File) => {
    setError("");
    setResult(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (src) URL.revokeObjectURL(src.url);
    setSrc({ file, url: URL.createObjectURL(file) });
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  // Draw result onto canvas when result changes
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = result.url;
  }, [result]);

  // Keep the original image element for restore tool
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => setOriginalImgRef(img);
    img.src = src.url;
  }, [src]);

  const getCanvasPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX: number, clientY: number;
    if ("touches" in e) {
      const t = e.touches[0];
      if (!t) return null;
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const paint = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas || activeTool === "none") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      // Draw a circle at position
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);

      if (activeTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
      } else if (activeTool === "restore" && originalImgRef) {
        ctx.globalCompositeOperation = "source-over";
        ctx.clip();
        ctx.drawImage(originalImgRef, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    },
    [activeTool, brushSize, originalImgRef],
  );

  const onPointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "none") return;
    setIsPainting(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = getCanvasPoint(e, canvas);
    if (!pt) return;
    lastPos.current = pt;
    paint(pt.x, pt.y);
  };

  const onPointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || activeTool === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = getCanvasPoint(e, canvas);
    if (!pt) return;
    // Interpolate for smooth strokes
    if (lastPos.current) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dx = pt.x - lastPos.current.x;
        const dy = pt.y - lastPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(dist / (brushSize / 4)));
        for (let i = 0; i <= steps; i++) {
          paint(
            lastPos.current.x + (dx * i) / steps,
            lastPos.current.y + (dy * i) / steps,
          );
        }
      }
    }
    lastPos.current = pt;
  };

  const onPointerUp = () => {
    setIsPainting(false);
    lastPos.current = null;
  };

  // Export canvas back to blob for download / share
  const getCanvasBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) { reject(new Error("No canvas")); return; }
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Canvas empty")),
        "image/png",
        1,
      );
    });

  const remove = async () => {
    if (!src) return;
    setBusy(true);
    setError("");
    setProgress(0);
    setStage("Preparing…");
    try {
      const blob = await removeBackground(src.file, {
        model: "isnet_fp16",
        output: { format: "image/png", quality: 1 },
        progress: (key, current, total) => {
          const pct = total ? Math.round((current / total) * 100) : 0;
          setProgress(pct);
          setStage(key.startsWith("fetch") ? "Downloading AI model…" : "Removing background…");
        },
      });
      const url = URL.createObjectURL(blob);
      await loadImage(url);
      if (result) URL.revokeObjectURL(result.url);
      const filename = `${baseName(src.file.name)}-no-bg.png`;
      setResult({ blob, url, filename });
    } catch {
      setError("Background removal failed. Please try a different image or check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const shareFile = async (): Promise<File> => {
    if (!result) throw new Error("No result");
    // Use canvas version (includes edits)
    try {
      const editedBlob = await getCanvasBlob();
      return new File([editedBlob], result.filename, { type: "image/png" });
    } catch {
      return new File([result.blob], result.filename, { type: "image/png" });
    }
  };

  const getDownloadBlob = async (): Promise<Blob> => {
    try { return await getCanvasBlob(); } catch { return result!.blob; }
  };

  return (
    <ToolPageShell
      backTo="/images"
      backLabel="Image Tools"
      icon={<Icon />}
      iconColor="#7c3aed"
      iconBg="#f5f3ff"
      title="Background Remover"
      description="Erase the background from any photo automatically. Runs privately in your browser."
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
            <span className={ls.dropHint}>PNG, JPG, WebP. A subject with a clear background works best</span>
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
              <span className={ls.fileSize}>{formatBytes(src.file.size)}</span>
            </div>
            <button type="button" className={ls.resetBtn} onClick={reset}>
              Change image
            </button>
          </div>

          {!result && (
            <div className={ls.comparison}>
              <div className={ls.compareCol}>
                <span className={ls.compareLabel}>Original</span>
                <div className={busy ? ls.scanWrap : undefined}>
                  <img src={src.url} alt="Original" className={ls.preview} />
                </div>
              </div>
            </div>
          )}

          {busy ? (
            <div className={ls.processing}>
              <span className={ls.processingTitle}>
                {stage === "Downloading AI model…" ? "Getting the AI ready…" : "Removing the background…"}
              </span>
              <ProgressBar value={progress} tone="purple" label={stage || "Working…"} />
              <span className={ls.dropHint}>
                {stage === "Downloading AI model…"
                  ? "First run downloads the AI model (one time). This can take a moment on slower connections."
                  : "Hang tight. Your cut-out will appear as soon as it's ready."}
              </span>
            </div>
          ) : (
            !result && (
              <button type="button" className={s.calcBtn} onClick={remove}>
                Remove Background
              </button>
            )
          )}

          {error && <p className={ls.errorMsg}>{error}</p>}

          {result && (
            <>
              <span className={ls.successMsg} role="status">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Background removed!
              </span>

              {/* ── Canvas result with editing ── */}
              <div className={ls.canvasWrap}>
                <canvas
                  ref={canvasRef}
                  className={`${ls.resultCanvas} ${activeTool !== "none" ? (activeTool === "eraser" ? ls.cursorEraser : ls.cursorRestore) : ""}`}
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerUp}
                  style={{ touchAction: activeTool !== "none" ? "none" : "auto" }}
                />
              </div>

              {/* ── Edit toolbar ── */}
              <div className={ls.editToolbar}>
                <span className={ls.editToolbarLabel}>Edit:</span>
                <button
                  type="button"
                  className={`${ls.toolBtn} ${activeTool === "eraser" ? ls.toolBtnActive : ""}`}
                  onClick={() => setActiveTool(t => t === "eraser" ? "none" : "eraser")}
                  title="Eraser — remove areas that should be transparent"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 20H7L3 16l10-10 7 7z"/>
                    <line x1="6" y1="14" x2="14" y2="6"/>
                  </svg>
                  Eraser
                </button>
                <button
                  type="button"
                  className={`${ls.toolBtn} ${activeTool === "restore" ? ls.toolBtnActive : ""}`}
                  onClick={() => setActiveTool(t => t === "restore" ? "none" : "restore")}
                  title="Restore pen — paint back original pixels"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  Restore
                </button>
                {activeTool !== "none" && (
                  <div className={ls.brushRow}>
                    <span className={ls.brushLabel}>Size</span>
                    <input
                      type="range"
                      min={5}
                      max={80}
                      value={brushSize}
                      onChange={e => setBrushSize(Number(e.target.value))}
                      className={ls.brushSlider}
                      aria-label="Brush size"
                    />
                    <span className={ls.brushValue}>{brushSize}px</span>
                  </div>
                )}
                {activeTool !== "none" && (
                  <button
                    type="button"
                    className={ls.toolBtnDone}
                    onClick={() => setActiveTool("none")}
                  >
                    Done
                  </button>
                )}
              </div>

              <div className={ls.actionRow}>
                <ImageDownloadMenu
                  blob={result.blob}
                  baseFilename={`${baseName(src.file.name)}-no-bg`}
                  nativeType="image/png"
                  formats={[
                    { type: "image/png", ext: "png", label: "PNG · transparent background" },
                    { type: "image/jpeg", ext: "jpg", label: "JPG · white background" },
                    { type: "image/webp", ext: "webp", label: "WebP · transparent background" },
                  ]}
                  getEditedBlob={getDownloadBlob}
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
    </ToolPageShell>
  );
};

export default BackgroundRemove;
