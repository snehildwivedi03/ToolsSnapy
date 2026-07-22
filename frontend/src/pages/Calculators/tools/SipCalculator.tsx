/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import CurrencyPicker from "../../../components/CurrencyPicker/CurrencyPicker";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

interface Result {
  invested: number;
  returns: number;
  total: number;
  months: number;
}

const SipCalculator = () => {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate]       = useState("");
  const [years, setYears]     = useState("");
  const [result, setResult]   = useState<Result | null>(null);
  const [currCode, setCurrCode]     = useState("INR");
  const [currSymbol, setCurrSymbol] = useState("₹");

  const calculate = () => {
    const P = parseFloat(monthly);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(years) * 12;
    if (!P || !r || !n || P <= 0 || n <= 0) return;

    // FV of annuity = P * [(1+r)^n - 1] / r * (1+r)
    const total   = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    const returns  = total - invested;

    setResult({
      invested: Math.round(invested),
      returns:  Math.round(returns),
      total:    Math.round(total),
      months:   n,
    });
  };

  const fmt = (n: number) => {
    if (currCode === "INR") {
      return n >= 10000000
        ? `${currSymbol} ${(n / 10000000).toFixed(2)} Cr`
        : n >= 100000
          ? `${currSymbol} ${(n / 100000).toFixed(2)} L`
          : `${currSymbol} ${n.toLocaleString("en-IN")}`;
    }
    return `${currSymbol}${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const pct = (a: number, total: number) =>
    total > 0 ? Math.round((a / total) * 100) : 0;

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="SIP Calculator"
      description="Estimate your Systematic Investment Plan returns over time with compounding."
    >
      <div className={s.workspace}>
        {/* Inputs */}
        <div className={s.card}>
          <span className={s.cardTitle}>Investment Details</span>

          <CurrencyPicker
            value={currCode}
            onChange={(code, symbol) => { setCurrCode(code); setCurrSymbol(symbol); }}
          />

          <div className={s.inputGroup}>
            <label className={s.label}>Monthly SIP Amount</label>
            <input className={s.input} type="number" placeholder="e.g. 5000"
              value={monthly} onChange={e => setMonthly(e.target.value)} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Expected Annual Return (%)</label>
            <input className={s.input} type="number" placeholder="e.g. 12" step="0.5"
              value={rate} onChange={e => setRate(e.target.value)} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Investment Period (years)</label>
            <input className={s.input} type="number" placeholder="e.g. 10"
              value={years} onChange={e => setYears(e.target.value)} />
          </div>

          <button className={s.calcBtn} onClick={calculate}>Calculate Returns</button>
        </div>

        {/* Results */}
        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Projected Returns</span>

            <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{fmt(result.total)}</div>
              <div className={s.resultLabel}>Total Value</div>
              <div className={s.resultSub}>After {result.months} months of SIP</div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardBlue}`}>
                <div className={s.resultValue}>{fmt(result.invested)}</div>
                <div className={s.resultLabel}>Invested ({pct(result.invested, result.total)}%)</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{fmt(result.returns)}</div>
                <div className={s.resultLabel}>Est. Returns ({pct(result.returns, result.total)}%)</div>
              </div>
            </div>

            {/* Simple bar showing split */}
            <div style={{ borderRadius: 8, overflow: "hidden", height: 12, display: "flex", gap: 2 }}>
              <div style={{
                flex: result.invested, background: "#3b82f6", borderRadius: "6px 0 0 6px"
              }} />
              <div style={{
                flex: result.returns, background: "#10b981", borderRadius: "0 6px 6px 0"
              }} />
            </div>
            <div className={s.hint}>
              Blue = Invested amount · Green = Estimated returns (past performance not indicative of future results)
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default SipCalculator;
