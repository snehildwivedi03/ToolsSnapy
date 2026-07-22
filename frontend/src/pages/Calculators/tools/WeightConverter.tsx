/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <circle cx="5" cy="12" r="3"/>
    <circle cx="19" cy="12" r="3"/>
    <line x1="8" y1="8" x2="8" y2="16"/>
    <line x1="16" y1="8" x2="16" y2="16"/>
  </svg>
);

// kg conversion factors
const TO_KG: Record<string, number> = {
  kg:    1,
  lbs:   0.453592,
  g:     0.001,
  oz:    0.0283495,
  stone: 6.35029,
};

const UNITS: { key: string; label: string; placeholder: string; decimals: number }[] = [
  { key: "kg",    label: "Kilograms (kg)",  placeholder: "e.g. 70",    decimals: 3 },
  { key: "lbs",   label: "Pounds (lbs)",    placeholder: "e.g. 154.3", decimals: 2 },
  { key: "g",     label: "Grams (g)",       placeholder: "e.g. 70000", decimals: 0 },
  { key: "oz",    label: "Ounces (oz)",     placeholder: "e.g. 2469",  decimals: 1 },
  { key: "stone", label: "Stone (st)",      placeholder: "e.g. 11.02", decimals: 3 },
];

const WeightConverter = () => {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(UNITS.map(u => [u.key, ""]))
  );

  const handleChange = (key: string, raw: string) => {
    const v = parseFloat(raw);
    if (isNaN(v) || raw === "") {
      setValues(Object.fromEntries(UNITS.map(u => [u.key, u.key === key ? raw : ""])));
      return;
    }
    const kg = v * TO_KG[key];
    const next: Record<string, string> = {};
    for (const u of UNITS) {
      const converted = kg / TO_KG[u.key];
      next[u.key] = u.key === key ? raw : converted.toFixed(u.decimals);
    }
    setValues(next);
  };

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Weight Converter"
      description="Convert weight between kg, lbs, grams, ounces and stone instantly."
    >
      <div className={`${s.card} ${s.cardCenter}`}>
        <span className={s.cardTitle}>Type any value to convert all</span>

        {UNITS.map(u => (
          <div className={s.converterRow} key={u.key}>
            <span className={s.converterLabel}>{u.label}</span>
            <input
              className={s.input}
              type="number"
              placeholder={u.placeholder}
              value={values[u.key]}
              onChange={e => handleChange(u.key, e.target.value)}
            />
          </div>
        ))}

        <div className={s.hint}>Edit any field   all others update instantly.</div>
      </div>
    </ToolPageShell>
  );
};

export default WeightConverter;
