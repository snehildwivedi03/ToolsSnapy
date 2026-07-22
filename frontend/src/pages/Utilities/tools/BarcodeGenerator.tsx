/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./BarcodeGenerator.module.css";
import tp from "../../../styles/toolpage.module.css";
import { shareFiles } from "../../../services/shareApi";
import { incrementFiles } from "../../../services/shareCounter";
import Toast from "../../../components/Toast/Toast";

type BarcodeFormat = "CODE128" | "EAN13" | "EAN8" | "UPC" | "CODE39" | "ITF14";

const FORMATS: { value: BarcodeFormat; label: string }[] = [
  { value: "CODE128", label: "CODE 128 (general)" },
  { value: "CODE39", label: "CODE 39" },
  { value: "EAN13", label: "EAN-13 (13 digits)" },
  { value: "EAN8", label: "EAN-8 (8 digits)" },
  { value: "UPC", label: "UPC-A (12 digits)" },
  { value: "ITF14", label: "ITF-14 (14 digits)" },
];

const Icon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 5v14M7 5v14M11 5v14M15 5v3M19 5v3M15 14v5M19 14v5M15 11h4" />
  </svg>
);

const BarcodeGenerator = () => {
  const [text, setText] = useState("1234567890");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [showTxt, setShowTxt] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareErr, setShareErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleChange = (val: string) => {
    setText(val);
    setError(null);
    setShareCode(null);
    setShareErr("");
  };

  const download = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "barcode.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    setDownloadToast(true);
  };

  /** Convert the SVG barcode to a PNG blob via an off-screen canvas */
  const svgToPngBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const svg = svgRef.current?.querySelector("svg");
      if (!svg) {
        reject(new Error("No SVG"));
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || svg.clientWidth || 400;
        canvas.height = img.naturalHeight || svg.clientHeight || 160;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas empty"))),
          "image/png",
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("SVG load failed"));
      };
      img.src = url;
    });

  const shareBarcode = async () => {
    setShareErr("");
    setShareCode(null);
    setSharing(true);
    try {
      const blob = await svgToPngBlob();
      const file = new File([blob], "barcode.png", { type: "image/png" });
      const res = await shareFiles([file], "images");
      if (res.success && res.code) {
        setShareCode(res.code);
        incrementFiles();
      } else {
        setShareErr(res.message ?? "We couldn't share that. Please try again.");
      }
    } catch {
      setShareErr("Could not share. Try again.");
    } finally {
      setSharing(false);
    }
  };

  const copyCode = async () => {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const hasContent = text.trim().length > 0;

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Utilities"
      icon={<Icon />}
      iconColor="#d97706"
      iconBg="#fffbeb"
      title="Barcode Generator"
      description="Generate barcodes in multiple formats. Download as SVG for print-ready quality."
    >
      {downloadToast && (
        <Toast
          message="Downloaded successfully!"
          onClose={() => setDownloadToast(false)}
        />
      )}
      <div className={s.card}>
        <span className={s.cardTitle}>Barcode Options</span>

        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="bc-format">
            Format
          </label>
          <select
            id="bc-format"
            className={ls.select}
            value={format}
            onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="bc-text">
            Content
          </label>
          <input
            id="bc-text"
            className={s.input}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter text or number"
          />
        </div>

        <div className={ls.toggleRow}>
          <label className={ls.toggle}>
            <input
              type="checkbox"
              checked={showTxt}
              onChange={(e) => setShowTxt(e.target.checked)}
              className={ls.toggleInput}
            />
            <span className={ls.toggleTrack} aria-hidden="true" />
            Show text below barcode
          </label>
        </div>
      </div>

      {hasContent && (
        <div className={s.card}>
          {error ? (
            <p className={ls.error}>{error}</p>
          ) : (
            <div className={ls.barcodeWrap} ref={svgRef}>
              <Barcode
                value={text}
                format={format}
                displayValue={showTxt}
                width={2}
                height={80}
                margin={10}
              />
            </div>
          )}
          {!error && (
            <>
              <div className={ls.actionRow}>
                <button
                  type="button"
                  className={`${s.calcBtn} ${ls.dlBtn}`}
                  onClick={download}
                >
                  Download SVG
                </button>
                <button
                  type="button"
                  className={ls.shareBtn}
                  onClick={shareBarcode}
                  disabled={sharing}
                >
                  {sharing ? (
                    <>
                      <span className={ls.spinner} aria-hidden="true" />
                      Sharing…
                    </>
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Share via ToolSnapy
                    </>
                  )}
                </button>
              </div>

              {shareErr && <p className={ls.shareErr}>{shareErr}</p>}

              {shareCode && (
                <div className={ls.shareResult}>
                  <span className={ls.shareCodeLabel}>Share Code</span>
                  <span className={ls.shareCodeValue}>{shareCode}</span>
                  <div className={ls.shareActions}>
                    <button
                      style={{ minWidth: "7.5rem" }}
                      className={
                        copied
                          ? `${tp.btnSecondary} ${tp.btnCopied}`
                          : tp.btnSecondary
                      }
                      onClick={copyCode}
                    >
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                    <button
                      className={ls.receiveBtn}
                      onClick={() => navigate("/share/receive")}
                    >
                      Open Receive Page →
                    </button>
                  </div>
                  <span className={ls.shareExpiry}>Expires in 15 minutes</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </ToolPageShell>
  );
};

export default BarcodeGenerator;
