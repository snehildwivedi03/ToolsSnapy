import { useState, useCallback } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./ColorPicker.module.css";

/* ── Conversion helpers ────────────────────────────────── */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const rgbToCmyk = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round((1 - r - k) / (1 - k) * 100),
    m: Math.round((1 - g - k) / (1 - k) * 100),
    y: Math.round((1 - b - k) / (1 - k) * 100),
    k: Math.round(k * 100),
  };
};

const contrastColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000";
  const lum = 0.2126 * rgb.r / 255 + 0.7152 * rgb.g / 255 + 0.0722 * rgb.b / 255;
  return lum > 0.5 ? "#000000" : "#ffffff";
};

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/>
    <circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

const ColorPicker = () => {
  const [hex,    setHex]    = useState("#7C3AED");
  const [copied, setCopied] = useState<string | null>(null);

  const rgb  = hexToRgb(hex);
  const hsl  = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const cmyk = rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null;

  const handleHexInput = (val: string) => {
    setHex(val.startsWith("#") ? val : `#${val}`);
  };

  const copy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const formats = rgb && hsl && cmyk ? [
    { key: "hex",  label: "HEX",  value: hex.toUpperCase() },
    { key: "rgb",  label: "RGB",  value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: "hsl",  label: "HSL",  value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { key: "cmyk", label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    { key: "rgba", label: "RGBA", value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
  ] : [];

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Utilities"
      icon={<Icon />}
      iconColor="#ec4899"
      iconBg="#fdf2f8"
      title="Color Picker & Converter"
      description="Pick any color and get its HEX, RGB, HSL and CMYK values instantly."
    >
      {/* Picker */}
      <div className={s.card}>
        <span className={s.cardTitle}>Pick a Color</span>
        <div className={ls.pickerRow}>
          <label className={ls.colorSwatch} aria-label="Color picker">
            <input
              type="color"
              value={hex.length === 7 ? hex : "#7C3AED"}
              onChange={e => setHex(e.target.value)}
              className={ls.colorInput}
            />
            <span
              className={ls.swatchBox}
              style={{ background: hex, color: contrastColor(hex) }}
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </span>
          </label>

          <div className={ls.hexInputWrap}>
            <label className={s.label} htmlFor="hex-input">HEX Code</label>
            <input
              id="hex-input"
              className={s.input}
              value={hex}
              onChange={e => handleHexInput(e.target.value)}
              placeholder="#7C3AED"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview bar */}
        {rgb && (
          <div className={ls.preview} style={{ background: hex }}>
            <span className={ls.previewText} style={{ color: contrastColor(hex) }}>
              Preview: {hex.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* All formats */}
      {formats.length > 0 && (
        <div className={s.card}>
          <span className={s.cardTitle}>Color Values</span>
          <ul className={ls.formatList} role="list">
            {formats.map(f => (
              <li key={f.key} className={ls.formatItem}>
                <span className={ls.formatLabel}>{f.label}</span>
                <code className={ls.formatValue}>{f.value}</code>
                <button
                  type="button"
                  className={`${ls.copyBtn} ${copied === f.key ? ls.copyDone : ""}`}
                  onClick={() => copy(f.value, f.key)}
                >
                  {copied === f.key ? "✓" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

    </ToolPageShell>
  );
};

export default ColorPicker;
