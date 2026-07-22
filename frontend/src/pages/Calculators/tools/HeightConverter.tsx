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
    <line x1="12" y1="3" x2="12" y2="21"/>
    <polyline points="8 7 12 3 16 7"/>
    <polyline points="8 17 12 21 16 17"/>
    <line x1="9" y1="10" x2="12" y2="10"/>
    <line x1="9" y1="14" x2="12" y2="14"/>
  </svg>
);

// All conversions from meters
const TO_M = {
  cm: 0.01,
  m:  1,
  in: 0.0254,
};

const UNITS: { key: keyof typeof TO_M; label: string; placeholder: string }[] = [
  { key: "cm", label: "Centimetres (cm)",  placeholder: "e.g. 175" },
  { key: "m",  label: "Metres (m)",        placeholder: "e.g. 1.75" },
  { key: "in", label: "Inches (in)",       placeholder: "e.g. 68.9" },
];

const HeightConverter = () => {
  const [values, setValues] = useState<Record<string, string>>({ cm: "", m: "", in: "", ft: "" });
  const [ftIn, setFtIn] = useState({ ft: "", in: "" });

  const fromCm = (cm: number) => ({
    cm:  cm.toFixed(2),
    m:   (cm / 100).toFixed(4),
    in:  (cm / 2.54).toFixed(2),
    ft:  Math.floor(cm / 30.48).toString(),
    ftIn: Math.round(((cm / 30.48) % 1) * 12).toString(),
  });

  const handleChange = (key: keyof typeof TO_M, raw: string) => {
    setValues(p => ({ ...p, [key]: raw }));
    const v = parseFloat(raw);
    if (isNaN(v) || raw === "") {
      setValues({ cm: "", m: "", in: "" });
      setFtIn({ ft: "", in: "" });
      return;
    }
    const meters = v * TO_M[key];
    const cm     = meters * 100;
    const result = fromCm(cm);
    setValues({ cm: key === "cm" ? raw : result.cm, m: key === "m" ? raw : result.m, in: key === "in" ? raw : result.in });
    setFtIn({ ft: result.ft, in: result.ftIn });
  };

  const handleFtIn = (field: "ft" | "in", raw: string) => {
    setFtIn(p => ({ ...p, [field]: raw }));
    const ft  = field === "ft" ? parseFloat(raw) || 0 : parseFloat(ftIn.ft) || 0;
    const inc = field === "in" ? parseFloat(raw) || 0 : parseFloat(ftIn.in) || 0;
    const cm  = (ft * 30.48) + (inc * 2.54);
    if (cm > 0) {
      const result = fromCm(cm);
      setValues({ cm: result.cm, m: result.m, in: result.in });
    }
  };

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Height Converter"
      description="Convert height between centimetres, metres, feet & inches instantly."
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

        {/* ft + in combined */}
        <div className={s.converterRow}>
          <span className={s.converterLabel}>Feet & Inches</span>
          <div style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
            <input
              className={s.input}
              type="number"
              placeholder="ft"
              value={ftIn.ft}
              onChange={e => handleFtIn("ft", e.target.value)}
            />
            <input
              className={s.input}
              type="number"
              placeholder="in"
              value={ftIn.in}
              onChange={e => handleFtIn("in", e.target.value)}
            />
          </div>
        </div>

        <div className={s.hint}>Edit any field   all others update instantly.</div>
      </div>
    </ToolPageShell>
  );
};

export default HeightConverter;
