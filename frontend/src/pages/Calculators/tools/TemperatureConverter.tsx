import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
);

// All conversions from Celsius
function cToAll(c: number) {
  return {
    c:  c.toFixed(4).replace(/\.?0+$/, ""),
    f:  (c * 9/5 + 32).toFixed(4).replace(/\.?0+$/, ""),
    k:  (c + 273.15).toFixed(4).replace(/\.?0+$/, ""),
    r:  ((c + 273.15) * 9/5).toFixed(4).replace(/\.?0+$/, ""),
  };
}

type TempKey = "c" | "f" | "k" | "r";

const UNITS: { key: TempKey; label: string; placeholder: string }[] = [
  { key: "c", label: "Celsius (°C)",    placeholder: "e.g. 25"     },
  { key: "f", label: "Fahrenheit (°F)", placeholder: "e.g. 77"     },
  { key: "k", label: "Kelvin (K)",      placeholder: "e.g. 298.15" },
  { key: "r", label: "Rankine (°R)",    placeholder: "e.g. 536.67" },
];

function toCelsius(val: number, from: TempKey): number {
  switch (from) {
    case "c": return val;
    case "f": return (val - 32) * 5/9;
    case "k": return val - 273.15;
    case "r": return (val - 491.67) * 5/9;
  }
}

const TemperatureConverter = () => {
  const [values, setValues] = useState<Record<TempKey, string>>({ c: "", f: "", k: "", r: "" });

  const handleChange = (key: TempKey, raw: string) => {
    const v = parseFloat(raw);
    if (isNaN(v) || raw === "" || raw === "-") {
      setValues({ c: key === "c" ? raw : "", f: key === "f" ? raw : "",
                  k: key === "k" ? raw : "", r: key === "r" ? raw : "" });
      return;
    }
    const celsius = toCelsius(v, key);
    const result  = cToAll(celsius);
    setValues({
      c: key === "c" ? raw : result.c,
      f: key === "f" ? raw : result.f,
      k: key === "k" ? raw : result.k,
      r: key === "r" ? raw : result.r,
    });
  };

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Temperature Converter"
      description="Convert between Celsius, Fahrenheit, Kelvin and Rankine instantly."
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

export default TemperatureConverter;
