import { useState, useRef } from "react";
import Barcode from "react-barcode";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import RelatedTools from "../../../components/RelatedTools/RelatedTools";
import s from "../../../styles/calc.module.css";
import ls from "./BarcodeGenerator.module.css";

type BarcodeFormat = "CODE128" | "EAN13" | "EAN8" | "UPC" | "CODE39" | "ITF14";

const FORMATS: { value: BarcodeFormat; label: string }[] = [
  { value: "CODE128", label: "CODE 128 (general)" },
  { value: "CODE39",  label: "CODE 39" },
  { value: "EAN13",   label: "EAN-13 (13 digits)" },
  { value: "EAN8",    label: "EAN-8 (8 digits)" },
  { value: "UPC",     label: "UPC-A (12 digits)" },
  { value: "ITF14",   label: "ITF-14 (14 digits)" },
];

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5v14M7 5v14M11 5v14M15 5v3M19 5v3M15 14v5M19 14v5M15 11h4"/>
  </svg>
);

const BarcodeGenerator = () => {
  const [text,    setText]    = useState("1234567890");
  const [format,  setFormat]  = useState<BarcodeFormat>("CODE128");
  const [showTxt, setShowTxt] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const handleChange = (val: string) => {
    setText(val);
    setError(null);
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
      <div className={s.card}>
        <span className={s.cardTitle}>Barcode Options</span>

        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="bc-format">Format</label>
          <select
            id="bc-format"
            className={ls.select}
            value={format}
            onChange={e => setFormat(e.target.value as BarcodeFormat)}
          >
            {FORMATS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="bc-text">Content</label>
          <input
            id="bc-text" className={s.input}
            value={text}
            onChange={e => handleChange(e.target.value)}
            placeholder="Enter text or number"
          />
        </div>

        <div className={ls.toggleRow}>
          <label className={ls.toggle}>
            <input
              type="checkbox" checked={showTxt}
              onChange={e => setShowTxt(e.target.checked)}
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
                onError={() => setError(`"${text}" is not valid for ${format} format.`)}
              />
            </div>
          )}
          {!error && (
            <button type="button" className={`${s.calcBtn} ${ls.dlBtn}`} onClick={download}>
              Download SVG
            </button>
          )}
        </div>
      )}

      <RelatedTools currentId="barcode-generator" section="utilities" />
    </ToolPageShell>
  );
};

export default BarcodeGenerator;
