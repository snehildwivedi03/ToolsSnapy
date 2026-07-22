/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useCallback } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./UnitConverter.module.css";

/* ── Unit definitions ──────────────────────────────────── */
interface UnitDef { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }

type CategoryKey = "length" | "weight" | "temperature" | "area" | "volume" | "storage";

const CATEGORIES: Record<CategoryKey, { label: string; units: Record<string, UnitDef> }> = {
  length: {
    label: "Length",
    units: {
      m:   { label: "Meter (m)",       toBase: v => v,            fromBase: v => v },
      km:  { label: "Kilometer (km)",  toBase: v => v * 1000,     fromBase: v => v / 1000 },
      cm:  { label: "Centimeter (cm)", toBase: v => v / 100,      fromBase: v => v * 100 },
      mm:  { label: "Millimeter (mm)", toBase: v => v / 1000,     fromBase: v => v * 1000 },
      mi:  { label: "Mile (mi)",       toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
      yd:  { label: "Yard (yd)",       toBase: v => v * 0.9144,   fromBase: v => v / 0.9144 },
      ft:  { label: "Foot (ft)",       toBase: v => v * 0.3048,   fromBase: v => v / 0.3048 },
      in:  { label: "Inch (in)",       toBase: v => v * 0.0254,   fromBase: v => v / 0.0254 },
      nm:  { label: "Nanometer (nm)",  toBase: v => v * 1e-9,     fromBase: v => v * 1e9 },
      μm:  { label: "Micrometer (μm)", toBase: v => v * 1e-6,     fromBase: v => v * 1e6 },
      nmi: { label: "Nautical Mile",   toBase: v => v * 1852,     fromBase: v => v / 1852 },
      ly:  { label: "Light Year (ly)", toBase: v => v * 9.461e15, fromBase: v => v / 9.461e15 },
    },
  },
  weight: {
    label: "Weight / Mass",
    units: {
      kg:  { label: "Kilogram (kg)",   toBase: v => v,          fromBase: v => v },
      g:   { label: "Gram (g)",        toBase: v => v / 1000,   fromBase: v => v * 1000 },
      mg:  { label: "Milligram (mg)",  toBase: v => v * 1e-6,   fromBase: v => v * 1e6 },
      lb:  { label: "Pound (lb)",      toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
      oz:  { label: "Ounce (oz)",      toBase: v => v * 0.02834952, fromBase: v => v / 0.02834952 },
      t:   { label: "Metric Ton (t)",  toBase: v => v * 1000,   fromBase: v => v / 1000 },
      st:  { label: "Stone (st)",      toBase: v => v * 6.35029,fromBase: v => v / 6.35029 },
      μg:  { label: "Microgram (μg)",  toBase: v => v * 1e-9,   fromBase: v => v * 1e9 },
    },
  },
  temperature: {
    label: "Temperature",
    units: {
      C: { label: "Celsius (°C)",    toBase: v => v,                 fromBase: v => v },
      F: { label: "Fahrenheit (°F)", toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
      K: { label: "Kelvin (K)",      toBase: v => v - 273.15,        fromBase: v => v + 273.15 },
      R: { label: "Rankine (°R)",    toBase: v => (v - 491.67) * 5 / 9, fromBase: v => (v + 273.15) * 9 / 5 },
    },
  },
  area: {
    label: "Area",
    units: {
      m2:   { label: "Square Meter (m²)",      toBase: v => v,            fromBase: v => v },
      km2:  { label: "Square Kilometer (km²)", toBase: v => v * 1e6,      fromBase: v => v / 1e6 },
      cm2:  { label: "Square Centimeter (cm²)",toBase: v => v * 1e-4,     fromBase: v => v * 1e4 },
      mm2:  { label: "Square Millimeter (mm²)",toBase: v => v * 1e-6,     fromBase: v => v * 1e6 },
      ha:   { label: "Hectare (ha)",            toBase: v => v * 1e4,      fromBase: v => v / 1e4 },
      acre: { label: "Acre",                    toBase: v => v * 4046.856, fromBase: v => v / 4046.856 },
      ft2:  { label: "Square Foot (ft²)",       toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
      in2:  { label: "Square Inch (in²)",       toBase: v => v * 6.4516e-4,fromBase: v => v / 6.4516e-4 },
      mi2:  { label: "Square Mile (mi²)",       toBase: v => v * 2.59e6,   fromBase: v => v / 2.59e6 },
    },
  },
  volume: {
    label: "Volume",
    units: {
      L:    { label: "Liter (L)",          toBase: v => v,          fromBase: v => v },
      mL:   { label: "Milliliter (mL)",    toBase: v => v / 1000,   fromBase: v => v * 1000 },
      m3:   { label: "Cubic Meter (m³)",   toBase: v => v * 1000,   fromBase: v => v / 1000 },
      cm3:  { label: "Cubic Centimeter",   toBase: v => v / 1000,   fromBase: v => v * 1000 },
      gal:  { label: "Gallon (US)",        toBase: v => v * 3.78541,fromBase: v => v / 3.78541 },
      qt:   { label: "Quart (US)",         toBase: v => v * 0.946353,fromBase: v => v / 0.946353 },
      pt:   { label: "Pint (US)",          toBase: v => v * 0.473176,fromBase: v => v / 0.473176 },
      cup:  { label: "Cup (US)",           toBase: v => v * 0.236588,fromBase: v => v / 0.236588 },
      floz: { label: "Fluid Ounce (US)",   toBase: v => v * 0.0295735,fromBase: v => v / 0.0295735 },
      tbsp: { label: "Tablespoon",         toBase: v => v * 0.0147868,fromBase: v => v / 0.0147868 },
      tsp:  { label: "Teaspoon",           toBase: v => v * 0.00492892,fromBase: v => v / 0.00492892 },
    },
  },
  storage: {
    label: "Digital Storage",
    units: {
      B:   { label: "Byte (B)",          toBase: v => v,      fromBase: v => v },
      KB:  { label: "Kilobyte (KB)",     toBase: v => v*1024, fromBase: v => v/1024 },
      MB:  { label: "Megabyte (MB)",     toBase: v => v*1024**2, fromBase: v => v/1024**2 },
      GB:  { label: "Gigabyte (GB)",     toBase: v => v*1024**3, fromBase: v => v/1024**3 },
      TB:  { label: "Terabyte (TB)",     toBase: v => v*1024**4, fromBase: v => v/1024**4 },
      PB:  { label: "Petabyte (PB)",     toBase: v => v*1024**5, fromBase: v => v/1024**5 },
      Kib: { label: "Kibibyte (KiB)",    toBase: v => v*1024, fromBase: v => v/1024 },
      Mib: { label: "Mebibyte (MiB)",    toBase: v => v*1024**2, fromBase: v => v/1024**2 },
      b:   { label: "Bit (b)",           toBase: v => v/8,    fromBase: v => v*8 },
      Kb:  { label: "Kilobit (Kb)",      toBase: v => v*125,  fromBase: v => v/125 },
      Mb:  { label: "Megabit (Mb)",      toBase: v => v*125000, fromBase: v => v/125000 },
      Gb:  { label: "Gigabit (Gb)",      toBase: v => v*1.25e8, fromBase: v => v/1.25e8 },
    },
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

const DEFAULT_FROM: Record<CategoryKey, string> = {
  length: "m", weight: "kg", temperature: "C", area: "m2", volume: "L", storage: "MB",
};
const DEFAULT_TO: Record<CategoryKey, string> = {
  length: "km", weight: "lb", temperature: "F", area: "ft2", volume: "gal", storage: "GB",
};

const fmt = (n: number): string => {
  if (!isFinite(n)) return "";
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs >= 1e15 || (abs > 0 && abs < 1e-10)) return n.toExponential(6).replace(/\.?0+e/, "e");
  if (abs >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return parseFloat(n.toPrecision(10)).toString();
};

const convert = (value: number, fromKey: string, toKey: string, cat: CategoryKey): number => {
  const units = CATEGORIES[cat].units;
  const base  = units[fromKey].toBase(value);
  return units[toKey].fromBase(base);
};

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const UnitConverter = () => {
  const [cat,   setCat]   = useState<CategoryKey>("length");
  const [from,  setFrom]  = useState(DEFAULT_FROM["length"]);
  const [to,    setTo]    = useState(DEFAULT_TO["length"]);
  const [input, setInput] = useState("1");

  const handleCatChange = (newCat: CategoryKey) => {
    setCat(newCat);
    setFrom(DEFAULT_FROM[newCat]);
    setTo(DEFAULT_TO[newCat]);
    setInput("1");
  };

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const numVal  = parseFloat(input);
  const isValid = input.trim() !== "" && isFinite(numVal);
  const result  = isValid ? convert(numVal, from, to, cat) : null;

  const units = CATEGORIES[cat].units;
  const unitKeys = Object.keys(units);

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Utilities"
      icon={<Icon />}
      iconColor="#0891b2"
      iconBg="#ecfeff"
      title="Unit Converter"
      description="Convert between units across Length, Weight, Temperature, Area, Volume and Digital Storage."
    >
      {/* Category chips */}
      <div className={s.card}>
        <span className={s.cardTitle}>Category</span>
        <div className={s.chipGroup}>
          {CATEGORY_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              className={`${s.chip} ${cat === k ? s.chipActive : ""}`}
              onClick={() => handleCatChange(k)}
            >
              {CATEGORIES[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* Converter UI */}
      <div className={s.card}>
        <div className={ls.converterGrid}>
          {/* From */}
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="unit-from-val">Value</label>
            <input
              id="unit-from-val"
              className={s.input}
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter value"
            />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="unit-from-sel">From</label>
            <select
              id="unit-from-sel"
              className={ls.select}
              value={from}
              onChange={e => setFrom(e.target.value)}
            >
              {unitKeys.map(k => (
                <option key={k} value={k}>{units[k].label}</option>
              ))}
            </select>
          </div>

          {/* Swap */}
          <div className={ls.swapWrap}>
            <button type="button" className={ls.swapBtn} onClick={handleSwap} aria-label="Swap units">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>
          </div>

          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="unit-to-sel">To</label>
            <select
              id="unit-to-sel"
              className={ls.select}
              value={to}
              onChange={e => setTo(e.target.value)}
            >
              {unitKeys.map(k => (
                <option key={k} value={k}>{units[k].label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result */}
      {isValid && result !== null && (
        <div className={s.resultBlock}>
          <div className={s.resultCard}>
            <div className={`${s.resultValue} ${s.resultValueLg}`}>{fmt(result)}</div>
            <div className={s.resultLabel}>
              {units[to].label}
            </div>
          </div>

          <div className={`${s.resultCard} ${s.resultCardBlue}`}>
            <div className={s.resultValue}>
              {numVal} {from} = {fmt(result)} {to}
            </div>
            <div className={s.resultLabel}>Formula</div>
          </div>
        </div>
      )}

      {/* All conversions for this category */}
      {isValid && (
        <div className={s.card}>
          <span className={s.cardTitle}>All {CATEGORIES[cat].label} Conversions</span>
          <ul className={ls.allList} role="list">
            {unitKeys.map(k => {
              const val = convert(numVal, from, k, cat);
              return (
                <li key={k} className={`${ls.allItem} ${k === to ? ls.allItemActive : ""}`}>
                  <span className={ls.allLabel}>{units[k].label}</span>
                  <span className={ls.allVal}>{fmt(val)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

    </ToolPageShell>
  );
};

export default UnitConverter;
