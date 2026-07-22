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
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

interface Result {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  schedule: { month: number; emi: number; principal: number; interest: number; balance: number }[];
}

const EmiCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate]           = useState("");
  const [tenure, setTenure]       = useState("");
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("years");
  const [result, setResult]       = useState<Result | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [currCode, setCurrCode]     = useState("INR");
  const [currSymbol, setCurrSymbol] = useState("₹");

  const calculate = () => {
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const T = parseFloat(tenure);
    if (!P || !annualRate || !T || P <= 0 || annualRate <= 0 || T <= 0) return;

    const n = tenureUnit === "years" ? T * 12 : T;
    const r = annualRate / 12 / 100;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    // Amortization schedule (show first 12 months max in table preview)
    const schedule = [];
    let balance = P;
    for (let i = 1; i <= n; i++) {
      const intPart = balance * r;
      const prinPart = emi - intPart;
      balance -= prinPart;
      schedule.push({
        month: i,
        emi: Math.round(emi * 100) / 100,
        principal: Math.round(prinPart * 100) / 100,
        interest: Math.round(intPart * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
      });
    }

    setResult({
      emi: Math.round(emi * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      principal: P,
      schedule,
    });
    setShowTable(false);
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const money = (n: number) => `${currSymbol} ${fmt(n)}`;

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="EMI Calculator"
      description="Calculate monthly loan EMI, total interest and full amortization schedule."
    >
      <div className={s.workspace}>
        {/* Inputs */}
        <div className={s.card}>
          <span className={s.cardTitle}>Loan Details</span>

          <CurrencyPicker
            value={currCode}
            onChange={(code, symbol) => { setCurrCode(code); setCurrSymbol(symbol); }}
          />

          <div className={s.inputGroup}>
            <label className={s.label}>Loan Amount</label>
            <input className={s.input} type="number" placeholder="e.g. 500000"
              value={principal} onChange={e => setPrincipal(e.target.value)} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Annual Interest Rate (%)</label>
            <input className={s.input} type="number" placeholder="e.g. 8.5" step="0.1"
              value={rate} onChange={e => setRate(e.target.value)} />
          </div>

          <div className={`${s.inputGrid} ${s.inputGrid2}`}>
            <div className={s.inputGroup}>
              <label className={s.label}>Tenure</label>
              <input className={s.input} type="number" placeholder="e.g. 5"
                value={tenure} onChange={e => setTenure(e.target.value)} />
            </div>
            <div className={s.inputGroup}>
              <label className={s.label}>Unit</label>
              <select className={s.select} value={tenureUnit}
                onChange={e => setTenureUnit(e.target.value as "months" | "years")}>
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <button className={s.calcBtn} onClick={calculate}>Calculate EMI</button>
        </div>

        {/* Results */}
        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Breakdown</span>

            <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{money(result.emi)}</div>
              <div className={s.resultLabel}>Monthly EMI</div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{money(result.principal)}</div>
                <div className={s.resultLabel}>Principal</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardOrange}`}>
                <div className={s.resultValue}>{money(result.totalInterest)}</div>
                <div className={s.resultLabel}>Total Interest</div>
              </div>
            </div>

            <div className={s.resultCard}>
              <div className={s.resultValue}>{money(result.totalPayment)}</div>
              <div className={s.resultLabel}>Total Payment</div>
            </div>

            <button className={s.calcBtn} style={{ background: "var(--color-text-secondary)" }}
              onClick={() => setShowTable(p => !p)}>
              {showTable ? "Hide" : "Show"} Amortization Schedule
            </button>

            {showTable && (
              <div style={{ overflowX: "auto" }}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Month</th><th>EMI</th><th>Principal</th>
                      <th>Interest</th><th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map(row => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td>{fmt(row.emi)}</td>
                        <td>{fmt(row.principal)}</td>
                        <td>{fmt(row.interest)}</td>
                        <td>{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default EmiCalculator;
