/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./QrGenerator.module.css";
import tp from "../../../styles/toolpage.module.css";
import { shareFiles } from "../../../services/shareApi";
import { incrementFiles } from "../../../services/shareCounter";
import Toast from "../../../components/Toast/Toast";

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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="3" height="3" />
    <rect x="18" y="14" width="3" height="3" />
    <rect x="14" y="18" width="3" height="3" />
    <rect x="18" y="18" width="3" height="3" />
  </svg>
);

const QrGenerator = () => {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [generated, setGenerated] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareErr, setShareErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const generate = () => {
    const val = text.trim();
    if (!val) return;
    setGenerated(val);
    setDownloadToast("QR generated successfully!");
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const download = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloadToast("Downloaded successfully!");
  };

  const shareQR = async () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    setShareErr("");
    setShareCode(null);
    setSharing(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas empty"))),
          "image/png",
        ),
      );
      const file = new File([blob], "qrcode.png", { type: "image/png" });
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

  const goReceive = () => navigate("/share/receive");

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Utilities"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="QR Code Generator"
      description="Turn any URL or text into a QR code instantly. Download as PNG."
    >
      {downloadToast && (
        <Toast
          message={downloadToast}
          onClose={() => setDownloadToast(null)}
        />
      )}
      <div className={s.card}>
        <span className={s.cardTitle}>Content</span>
        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="qr-text">
            URL or Text
          </label>
          <textarea
            id="qr-text"
            className={`${s.input} ${ls.textarea}`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setGenerated(null);
            }}
            placeholder="https://example.com"
            rows={3}
          />
        </div>

        <div className={ls.generateRow}>
          <button
            type="button"
            className={s.calcBtn}
            onClick={generate}
            disabled={!text.trim()}
          >
            Generate QR Code
          </button>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardTitle}>Options</span>
        <div className={ls.optGrid}>
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="qr-size">
              Size (px)
            </label>
            <input
              id="qr-size"
              type="number"
              className={s.input}
              min={128}
              max={1024}
              step={32}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="qr-fg">
              Foreground
            </label>
            <div className={ls.colorRow}>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className={ls.colorPatch}
              />
              <span className={ls.colorCode}>{fgColor.toUpperCase()}</span>
            </div>
          </div>
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="qr-bg">
              Background
            </label>
            <div className={ls.colorRow}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className={ls.colorPatch}
              />
              <span className={ls.colorCode}>{bgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {generated && (
        <div className={s.card} ref={resultRef}>
          <div className={ls.qrWrap} ref={canvasRef}>
            <QRCodeCanvas
              value={generated}
              size={Math.min(size, 512)}
              fgColor={fgColor}
              bgColor={bgColor}
              level="M"
              marginSize={2}
            />
          </div>

          <div className={ls.actionRow}>
            <button
              type="button"
              className={`${s.calcBtn} ${ls.dlBtn}`}
              onClick={download}
            >
              Download PNG
            </button>
            <button
              type="button"
              className={ls.shareBtn}
              onClick={shareQR}
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
                  className={
                    copied
                      ? `${tp.btnSecondary} ${tp.btnCopied}`
                      : tp.btnSecondary
                  }
                  onClick={copyCode}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
                <button className={ls.receiveBtn} onClick={goReceive}>
                  Open Receive Page →
                </button>
              </div>
              <span className={ls.shareExpiry}>Expires in 15 minutes</span>
            </div>
          )}
        </div>
      )}
    </ToolPageShell>
  );
};

export default QrGenerator;
