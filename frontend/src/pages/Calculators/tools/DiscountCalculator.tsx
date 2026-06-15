import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import CurrencyPicker from "../../../components/CurrencyPicker/CurrencyPicker";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 12V22H4V12"/>
    <path d="M22 7H2v5h20V7z"/>
    <path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

type CalcMode = "forward" | "reverse";

interface Result {
  discount: number;
  finalPrice: number;
  savings: number;
  savingsPct: number;
}

const DiscountCalculator = () => {
  const [mode, setMode]     = useState<CalcMode>("forward");
  const [currCode, setCurrCode]     = useState("USD");
  const [currSymbol, setCurrSymbol] = useState("$");
  // Forward: original + discount%
  const [original, setOriginal] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  // Reverse: original + final price
  const [finalInput, setFinalInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const QUICK_DISCOUNTS = [5, 10, 15, 20, 25, 30, 50];

  const calculate = () => {
    const orig = parseFloat(original);
    if (isNaN(orig) || orig <= 0) return;

    if (mode === "forward") {
      const pct = parseFloat(discountPct);
      if (isNaN(pct) || pct < 0 || pct > 100) return;
      const discount  = (orig * pct) / 100;
      const final     = orig - discount;
      setResult({ discount, finalPrice: final, savings: discount, savingsPct: pct });
    } else {
      const final = parseFloat(finalInput);
      if (isNaN(final) || final >= orig) return;
      const savings    = orig - final;
      const savingsPct = (savings / orig) * 100;
      setResult({ discount: savings, finalPrice: final, savings, savingsPct });
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const money = (n: number) => `${currSymbol}${fmt(n)}`;

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Discount Calculator"
      description="Find the final price after discount, or reverse-calculate the discount percentage."
    >
      <div className={s.workspace}>
        <div className={s.card}>
          <span className={s.cardTitle}>Calculation Mode</span>

          <CurrencyPicker
            value={currCode}
            onChange={(code, symbol) => { setCurrCode(code); setCurrSymbol(symbol); }}
          />

          <div className={s.radioGroup}>
            <button className={`${s.radioBtn} ${mode === "forward" ? s.radioBtnActive : ""}`}
              onClick={() => { setMode("forward"); setResult(null); }}>
              Price → Discount
            </button>
            <button className={`${s.radioBtn} ${mode === "reverse" ? s.radioBtnActive : ""}`}
              onClick={() => { setMode("reverse"); setResult(null); }}>
              Find % Off
            </button>
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Original Price</label>
            <input className={s.input} type="number" placeholder="e.g. 120.00" step="0.01"
              value={original} onChange={e => setOriginal(e.target.value)} />
          </div>

          {mode === "forward" ? (
            <div className={s.inputGroup}>
              <label className={s.label}>Discount (%)</label>
              <div className={s.chipRow}>
                {QUICK_DISCOUNTS.map(d => (
                  <button key={d}
                    className={`${s.chip} ${discountPct === String(d) ? s.chipActive : ""}`}
                    onClick={() => setDiscountPct(String(d))}>
                    {d}%
                  </button>
                ))}
              </div>
              <input className={s.input} type="number" placeholder="Custom %" step="0.5"
                value={discountPct} onChange={e => setDiscountPct(e.target.value)}
                style={{ marginTop: "0.5rem" }} />
            </div>
          ) : (
            <div className={s.inputGroup}>
            <label className={s.label}>Final / Sale Price</label>
              <input className={s.input} type="number" placeholder="e.g. 84.00" step="0.01"
                value={finalInput} onChange={e => setFinalInput(e.target.value)} />
            </div>
          )}

          <button className={s.calcBtn} onClick={calculate}>Calculate</button>
        </div>

        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Savings Breakdown</span>

            <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{money(result.finalPrice)}</div>
              <div className={s.resultLabel}>Final Price</div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{money(result.savings)}</div>
                <div className={s.resultLabel}>You Save</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardOrange}`}>
                <div className={s.resultValue}>{result.savingsPct.toFixed(1)}%</div>
                <div className={s.resultLabel}>Discount %</div>
              </div>
            </div>

            <div className={s.resultCard}>
              <div className={s.resultValue}>{money(parseFloat(original))}</div>
              <div className={s.resultLabel}>Original Price</div>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default DiscountCalculator;
