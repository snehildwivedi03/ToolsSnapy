import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/>
  </svg>
);

const TIP_PRESETS = [10, 15, 18, 20, 25];

interface Result {
  tipAmount: number;
  totalBill: number;
  perPerson: number;
  tipPerPerson: number;
}

const TipCalculator = () => {
  const [bill, setBill]       = useState("");
  const [tipPct, setTipPct]   = useState("15");
  const [people, setPeople]   = useState("1");
  const [result, setResult]   = useState<Result | null>(null);

  const calculate = () => {
    const b = parseFloat(bill);
    const t = parseFloat(tipPct);
    const n = parseInt(people) || 1;
    if (!b || b <= 0 || isNaN(t)) return;

    const tipAmount   = (b * t) / 100;
    const totalBill   = b + tipAmount;
    const perPerson   = totalBill / n;
    const tipPerPerson = tipAmount / n;

    setResult({ tipAmount, totalBill, perPerson, tipPerPerson });
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Tip Calculator"
      description="Calculate tip amount and split the bill between any number of people."
    >
      <div className={s.workspace}>
        <div className={s.card}>
          <span className={s.cardTitle}>Bill Details</span>

          <div className={s.inputGroup}>
            <label className={s.label}>Bill Amount ($)</label>
            <input className={s.input} type="number" placeholder="e.g. 75.50" step="0.01"
              value={bill} onChange={e => setBill(e.target.value)} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Tip Percentage</label>
            <div className={s.chipRow}>
              {TIP_PRESETS.map(p => (
                <button key={p}
                  className={`${s.chip} ${tipPct === String(p) ? s.chipActive : ""}`}
                  onClick={() => setTipPct(String(p))}>
                  {p}%
                </button>
              ))}
            </div>
            <input className={s.input} type="number" placeholder="Custom %" step="0.5"
              value={tipPct} onChange={e => setTipPct(e.target.value)}
              style={{ marginTop: "0.5rem" }} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Number of People</label>
            <input className={s.input} type="number" min="1" placeholder="e.g. 4"
              value={people} onChange={e => setPeople(e.target.value)} />
          </div>

          <button className={s.calcBtn} onClick={calculate}>Calculate</button>
        </div>

        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Summary</span>

            <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>${fmt(result.perPerson)}</div>
              <div className={s.resultLabel}>Per Person</div>
              <div className={s.resultSub}>Split between {parseInt(people) || 1} people</div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>${fmt(result.tipAmount)}</div>
                <div className={s.resultLabel}>Total Tip ({tipPct}%)</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardBlue}`}>
                <div className={s.resultValue}>${fmt(result.totalBill)}</div>
                <div className={s.resultLabel}>Total Bill</div>
              </div>
            </div>

            {parseInt(people) > 1 && (
              <div className={`${s.resultCard} ${s.resultCardYellow}`}>
                <div className={s.resultValue}>${fmt(result.tipPerPerson)}</div>
                <div className={s.resultLabel}>Tip Per Person</div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default TipCalculator;
