import { useRef, useState, useEffect, useCallback } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import s from "../../../styles/calc.module.css";
import ls from "./imageTools.module.css";
import ShareViaToolSnapy from "./ShareViaToolSnapy";
import ImageDownloadMenu from "./ImageDownloadMenu";
import { baseName, formatBytes, loadImage } from "./imageUtils";
import type { BgRemoveRequest, BgRemoveResponse } from "./bgRemoveWorker";
import { usePasteImage } from "../../../hooks/usePasteImage";

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

/** Convert browser client coordinates to canvas pixel coordinates. */
function clientToCanvas(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  // The canvas is shown with `object-fit: contain`, so the bitmap can be
  // letterboxed inside the element box. Map clicks against the *visible*
  // image area, not the full element, otherwise the brush lands off-target.
  const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
  const drawnW = canvas.width * scale;
  const drawnH = canvas.height * scale;
  const padX = (rect.width - drawnW) / 2;
  const padY = (rect.height - drawnH) / 2;
  return {
    x: (clientX - rect.left - padX) / scale,
    y: (clientY - rect.top - padY) / scale,
  };
}

const BackgroundRemove = () => {
  const [src, setSrc] = useState<SourceState | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComputing, setIsComputing] = useState(false);
  const [stage, setStage] = useState("");
  const [timeDisplay, setTimeDisplay] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs for progress tracking
  const downloadBytesRef = useRef<Map<string, { current: number; total: number }>>(new Map());
  const downloadStartRef = useRef<number>(0);
  const inferenceStartRef = useRef<number>(0);
  const inferenceStartedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Canvas editing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<EditTool>("none");
  const [brushSize, setBrushSize] = useState(40);

  // Refs for the painting hot path — no React re-renders during drag
  const activeToolRef = useRef<EditTool>("none");
  const brushSizeRef = useRef(20);
  const origImgRef = useRef<HTMLImageElement | null>(null);
  const isPaintingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Keep painting refs in sync with state
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);

  // Terminate any running worker when the component unmounts
  useEffect(() => () => { workerRef.current?.terminate(); }, []);

  const reset = () => {
    if (src) URL.revokeObjectURL(src.url);
    if (result) URL.revokeObjectURL(result.url);
    workerRef.current?.terminate();
    workerRef.current = null;
    setSrc(null);
    setResult(null);
    setError("");
    setProgress(0);
    setIsComputing(false);
    setTimeDisplay("");
    setActiveTool("none");
    activeToolRef.current = "none";
    origImgRef.current = null;
    isPaintingRef.current = false;
    lastPos.current = null;
    clearTimer();
    downloadBytesRef.current.clear();
    inferenceStartedRef.current = false;
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

  // Paste an image from the clipboard (Ctrl/Cmd+V) while on the upload screen.
  usePasteImage((files) => {
    const file = files[0];
    if (file) loadFile(file);
  }, !src);

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
    if (!src) { origImgRef.current = null; return; }
    const img = new Image();
    img.onload = () => { origImgRef.current = img; };
    img.src = src.url;
  }, [src]);

  // Core paint function — reads only refs, zero React overhead during drag
  const paintAt = useCallback((
    x: number,
    y: number,
    from?: { x: number; y: number },
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tool = activeToolRef.current;
    const size = brushSizeRef.current;

    const drawDot = (cx: number, cy: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
      } else if (tool === "restore" && origImgRef.current) {
        ctx.globalCompositeOperation = "source-over";
        ctx.clip();
        ctx.drawImage(origImgRef.current, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    };

    if (from) {
      const dx = x - from.x;
      const dy = y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / Math.max(1, size / 4)));
      for (let i = 0; i <= steps; i++) {
        drawDot(from.x + (dx * i) / steps, from.y + (dy * i) / steps);
      }
    } else {
      drawDot(x, y);
    }
  }, []); // Empty deps — reads only stable refs

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeToolRef.current === "none") return;
    isPaintingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = clientToCanvas(e.clientX, e.clientY, canvas);
    lastPos.current = pt;
    paintAt(pt.x, pt.y);
  }, [paintAt]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current || activeToolRef.current === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = clientToCanvas(e.clientX, e.clientY, canvas);
    paintAt(pt.x, pt.y, lastPos.current ?? undefined);
    lastPos.current = pt;
  }, [paintAt]);

  const onMouseUp = useCallback(() => {
    isPaintingRef.current = false;
    lastPos.current = null;
  }, []);

  // Native touch listeners — { passive: false } lets us call preventDefault()
  // to block page scroll while painting on mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;

    const onTouchStart = (e: TouchEvent) => {
      if (activeToolRef.current === "none") return;
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (!touch) return;
      isPaintingRef.current = true;
      const pt = clientToCanvas(touch.clientX, touch.clientY, canvas);
      lastPos.current = pt;
      paintAt(pt.x, pt.y);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPaintingRef.current || activeToolRef.current === "none") return;
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (!touch) return;
      const pt = clientToCanvas(touch.clientX, touch.clientY, canvas);
      paintAt(pt.x, pt.y, lastPos.current ?? undefined);
      lastPos.current = pt;
    };

    const onTouchEnd = () => {
      isPaintingRef.current = false;
      lastPos.current = null;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [result, paintAt]);

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

  const remove = () => {
    if (!src) return;
    setBusy(true);
    setError("");
    setProgress(0);
    setTimeDisplay("");
    setIsComputing(true);
    setStage("Preparing…");
    downloadBytesRef.current.clear();
    inferenceStartedRef.current = false;
    clearTimer();

    let fallbackId: ReturnType<typeof setTimeout> | null = null;
    const clearFallback = () => {
      if (fallbackId !== null) { clearTimeout(fallbackId); fallbackId = null; }
    };

    /** Start the elapsed counter — idempotent. */
    const startComputeTimer = () => {
      if (inferenceStartedRef.current) return;
      inferenceStartedRef.current = true;
      inferenceStartRef.current = Date.now();
      clearTimer();
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - inferenceStartRef.current) / 1000);
        const m = Math.floor(secs / 60);
        const sec = secs % 60;
        setTimeDisplay(`${m}:${String(sec).padStart(2, "0")} elapsed`);
      }, 1000);
    };

    // Fallback: cached model with no events at all → show indeterminate after 1.2 s.
    fallbackId = setTimeout(() => {
      startComputeTimer();
      setStage("Removing background…");
    }, 1200);

    /** Translate the worker's progress events into UI state. */
    const handleProgress = (key: string, current: number, total: number) => {
      if (key.startsWith("fetch:")) {
        // ── Download phase ─────────────────────────────────────────
        clearFallback();

        const map = downloadBytesRef.current;
        if (!map.has(key)) {
          map.set(key, { current: 0, total: total || 0 });
          if (map.size === 1) downloadStartRef.current = Date.now();
        }
        map.set(key, { current, total: total || 0 });

        let totalCurrent = 0;
        let totalTotal = 0;
        map.forEach(({ current: c, total: t }) => {
          totalCurrent += c;
          totalTotal += t;
        });

        const pct = totalTotal > 0 ? Math.round((totalCurrent / totalTotal) * 100) : 0;
        setStage("Downloading AI model…");

        if (totalTotal > 0) {
          setIsComputing(false);
          setProgress(pct);
          // Speed-based remaining estimate
          const dlElapsed = (Date.now() - downloadStartRef.current) / 1000;
          if (totalCurrent > 1024 && totalTotal > totalCurrent && dlElapsed > 0.3) {
            const speed = totalCurrent / dlElapsed;
            const remaining = (totalTotal - totalCurrent) / speed;
            setTimeDisplay(remaining > 1 ? `~${Math.ceil(remaining)}s remaining` : "Almost done…");
          } else {
            setTimeDisplay("");
          }
        } else {
          // Unknown content-length — indeterminate sweep
          setIsComputing(true);
          setTimeDisplay("");
        }

      } else if (key.startsWith("compute:")) {
        // ── Compute phase (decode → inference → mask → encode) ─────
        // Inference now runs in a Web Worker, so the main thread stays free
        // and the indeterminate bar animates smoothly the whole time.
        clearFallback();
        startComputeTimer();
        setIsComputing(true);
        setStage("Removing background…");
      } else {
        // Unknown event type — fall back to indeterminate
        clearFallback();
        startComputeTimer();
        setStage("Removing background…");
      }
    };

    const finish = () => {
      clearFallback();
      workerRef.current?.terminate();
      workerRef.current = null;
      setBusy(false);
      setIsComputing(false);
      clearTimer();
      setTimeDisplay("");
    };

    const fail = () => {
      setError("Background removal failed. Please try a different image or check your connection.");
      finish();
    };

    // Offload the heavy ONNX inference to a worker thread so the UI never freezes.
    const worker = new Worker(new URL("./bgRemoveWorker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<BgRemoveResponse>) => {
      const msg = e.data;
      if (msg.type === "progress") {
        handleProgress(msg.key, msg.current, msg.total);
      } else if (msg.type === "done") {
        clearFallback();
        const url = URL.createObjectURL(msg.blob);
        loadImage(url)
          .catch(() => {})
          .finally(() => {
            const filename = `${baseName(src.file.name)}-no-bg.png`;
            setResult({ blob: msg.blob, url, filename });
            finish();
          });
      } else {
        fail();
      }
    };

    worker.onerror = fail;

    worker.postMessage({
      file: src.file,
      config: { model: "isnet_fp16", output: { format: "image/png", quality: 1 } },
    } satisfies BgRemoveRequest);
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
              <ProgressBar value={isComputing ? undefined : progress} tone="purple" label={stage || "Working…"} />
              {timeDisplay && (
                <span className={ls.processingTimer}>{timeDisplay}</span>
              )}
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
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
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
                      max={150}
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
