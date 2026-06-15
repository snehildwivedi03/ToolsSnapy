import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import RelatedTools from "../../../components/RelatedTools/RelatedTools";
import s from "../../../styles/calc.module.css";
import ls from "./QrGenerator.module.css";

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="3" height="3"/>
    <rect x="18" y="14" width="3" height="3"/>
    <rect x="14" y="18" width="3" height="3"/>
    <rect x="18" y="18" width="3" height="3"/>
  </svg>
);

const QrGenerator = () => {
  const [text,      setText]      = useState("https://example.com");
  const [size,      setSize]      = useState(256);
  const [fgColor,   setFgColor]   = useState("#000000");
  const [bgColor,   setBgColor]   = useState("#ffffff");
  const [generated, setGenerated] = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const generate = () => {
    const val = text.trim();
    if (!val) return;
    setGenerated(val);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
  };

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
      <div className={s.card}>
        <span className={s.cardTitle}>Content</span>
        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="qr-text">URL or Text</label>
          <textarea
            id="qr-text"
            className={`${s.input} ${ls.textarea}`}
            value={text}
            onChange={e => { setText(e.target.value); setGenerated(null); setSuccess(false); }}
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

          {success && (
            <span className={ls.successMsg} role="status">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              QR generated successfully!
            </span>
          )}
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardTitle}>Options</span>
        <div className={ls.optGrid}>
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="qr-size">Size (px)</label>
            <input
              id="qr-size" type="number" className={s.input}
              min={128} max={1024} step={32} value={size}
              onChange={e => setSize(Number(e.target.value))}
            />
          </div>
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="qr-fg">Foreground</label>
            <div className={ls.colorRow}>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className={ls.colorPatch} />
              <span className={ls.colorCode}>{fgColor.toUpperCase()}</span>
            </div>
          </div>
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="qr-bg">Background</label>
            <div className={ls.colorRow}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className={ls.colorPatch} />
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
          <button type="button" className={`${s.calcBtn} ${ls.dlBtn}`} onClick={download}>
            Download PNG
          </button>
        </div>
      )}

      <RelatedTools currentId="qr-generator" section="utilities" />
    </ToolPageShell>
  );
};

export default QrGenerator;
