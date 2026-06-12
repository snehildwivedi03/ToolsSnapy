import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="5" x2="5" y2="19"/>
    <circle cx="6.5" cy="6.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

type Mode = "percentOf" | "whatPercent" | "change" | "addPercent" | "subtractPercent";

const MODES: { id: Mode; label: string }[] = [
  { id: "percentOf",      label: "X% of Y"       },
  { id: "whatPercent",    label: "X is ?% of Y"  },
  { id: "change",         label: "% Change"      },
  { id: "addPercent",     label: "Y + X%"        },
  { id: "subtractPercent",label: "Y − X%"        },
];

const PercentageCalculator = () => {
  const [mode, setMode] = useState<Mode>("percentOf");
  const [x, setX]       = useState("");
  const [y, setY]       = useState("");
  const [result, setResult] = useState<{ value: string; label: string; sub?: string } | null>(null);

  const calculate = () => {
    const xv = parseFloat(x);
    const yv = parseFloat(y);
    if (isNaN(xv) || isNaN(yv)) return;

    switch (mode) {
      case "percentOf":
        setResult({ value: ((xv / 100) * yv).toFixed(4).replace(/\.?0+$/, ""),
          label: `${xv}% of ${yv}` });
        break;
      case "whatPercent":
        setResult({ value: ((xv / yv) * 100).toFixed(4).replace(/\.?0+$/, "") + "%",
          label: `${xv} is _% of ${yv}` });
        break;
      case "change": {
        const pct = ((yv - xv) / Math.abs(xv)) * 100;
        setResult({
          value: (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%",
          label: `Change from ${xv} to ${yv}`,
          sub: pct >= 0 ? "Increase" : "Decrease",
        });
        break;
      }
      case "addPercent":
        setResult({ value: (yv + (yv * xv) / 100).toFixed(4).replace(/\.?0+$/, ""),
          label: `${yv} + ${xv}%` });
        break;
      case "subtractPercent":
        setResult({ value: (yv - (yv * xv) / 100).toFixed(4).replace(/\.?0+$/, ""),
          label: `${yv} − ${xv}%` });
        break;
    }
  };

  const xLabel = mode === "change" ? "From (X)" : mode === "whatPercent" ? "Value (X)" : "Percent (X%)";
  const yLabel = mode === "change" ? "To (Y)"   : "Number (Y)";

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Percentage Calculator"
      description="Five percentage modes   find %, what %, % change, add/subtract % in one tool."
    >
      <div className={s.workspace}>
        <div className={s.card}>
          <span className={s.cardTitle}>Mode</span>

          <div className={s.chipRow}>
            {MODES.map(m => (
              <button key={m.id}
                className={`${s.chip} ${mode === m.id ? s.chipActive : ""}`}
                onClick={() => { setMode(m.id); setResult(null); }}>
                {m.label}
              </button>
            ))}
          </div>

          <div className={`${s.inputGrid} ${s.inputGrid2}`}>
            <div className={s.inputGroup}>
              <label className={s.label}>{xLabel}</label>
              <input className={s.input} type="number" placeholder="e.g. 25"
                value={x} onChange={e => setX(e.target.value)} />
            </div>
            <div className={s.inputGroup}>
              <label className={s.label}>{yLabel}</label>
              <input className={s.input} type="number" placeholder="e.g. 200"
                value={y} onChange={e => setY(e.target.value)} />
            </div>
          </div>

          <button className={s.calcBtn} onClick={calculate}>Calculate</button>
        </div>

        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Result</span>
            <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{result.value}</div>
              <div className={s.resultLabel}>{result.label}</div>
              {result.sub && <div className={s.resultSub}>{result.sub}</div>}
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default PercentageCalculator;
