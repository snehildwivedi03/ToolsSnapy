import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

interface Result {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
  nextBirthday: number;
  dayOfWeek: string;
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const AgeCalculator = () => {
  const [dob, setDob]     = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const to    = new Date(toDate);
    if (birth > to) return;

    let years  = to.getFullYear() - birth.getFullYear();
    let months = to.getMonth() - birth.getMonth();
    let days   = to.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays   = Math.floor((to.getTime() - birth.getTime()) / 86400000);
    const totalMonths = years * 12 + months;

    // Days until next birthday
    const next = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < to) next.setFullYear(next.getFullYear() + 1);
    const nextBirthday = Math.ceil((next.getTime() - to.getTime()) / 86400000);

    setResult({
      years, months, days, totalDays, totalMonths,
      nextBirthday,
      dayOfWeek: DAYS[birth.getDay()],
    });
  };

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Age Calculator"
      description="Calculate exact age in years, months and days, plus total days lived and next birthday."
    >
      <div className={s.workspace}>
        <div className={s.card}>
          <span className={s.cardTitle}>Date of Birth</span>

          <div className={s.inputGroup}>
            <label className={s.label}>Date of Birth</label>
            <input className={s.input} type="date"
              value={dob} onChange={e => setDob(e.target.value)}
              max={toDate} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>Age as of</label>
            <input className={s.input} type="date"
              value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>

          <button className={s.calcBtn} onClick={calculate}>Calculate Age</button>
        </div>

        {result && (
          <div className={s.card}>
            <span className={s.cardTitle}>Your Age</span>

            <div className={`${s.resultGrid} ${s.resultGrid3}`}>
              <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
                <div className={s.resultValue}>{result.years}</div>
                <div className={s.resultLabel}>Years</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardBlue}`}>
                <div className={s.resultValue}>{result.months}</div>
                <div className={s.resultLabel}>Months</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{result.days}</div>
                <div className={s.resultLabel}>Days</div>
              </div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={s.resultCard}>
                <div className={s.resultValue}>{result.totalDays.toLocaleString()}</div>
                <div className={s.resultLabel}>Total Days Lived</div>
              </div>
              <div className={s.resultCard}>
                <div className={s.resultValue}>{result.totalMonths}</div>
                <div className={s.resultLabel}>Total Months</div>
              </div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardOrange}`}>
                <div className={s.resultValue}>{result.nextBirthday}</div>
                <div className={s.resultLabel}>Days Until Birthday</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardYellow}`}>
                <div className={s.resultValue}>{result.dayOfWeek}</div>
                <div className={s.resultLabel}>Born On</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default AgeCalculator;
