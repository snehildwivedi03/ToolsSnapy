import { useState, useRef, useEffect } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import cs from "./AgeCalculator.module.css";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

/* ── Months / Day names ─────────────────────────────────── */
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const WEEK_DAYS  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/* ── Custom Date Picker ─────────────────────────────────── */
interface DPProps {
  value: string;          // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
  label: string;
  max?: string;
  min?: string;
}

const DatePicker = ({ value, onChange, label, max, min }: DPProps) => {
  const today   = new Date();
  const parsed  = value ? new Date(value + "T00:00:00") : null;
  const [open, setOpen]       = useState(false);
  const [viewYear, setViewYear]   = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth()    ?? today.getMonth());
  const [mode, setMode]       = useState<"days"|"months"|"years">("days");
  const panelRef   = useRef<HTMLDivElement>(null);
  const yearGridRef = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  /* scroll to active year when year mode opens */
  useEffect(() => {
    if (mode === "years" && yearGridRef.current) {
      const el = yearGridRef.current.querySelector("[data-active='true']") as HTMLElement | null;
      el?.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [mode]);

  const openPicker = () => {
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
    setMode("days");
    setOpen(o => !o);
  };

  const select = (year: number, month: number, day: number) => {
    const str = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    if (max && str > max) return;
    if (min && str < min) return;
    onChange(str);
    setOpen(false);
  };

  const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  /* build 6-week grid */
  const firstDow     = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev   = new Date(viewYear, viewMonth, 0).getDate();
  type Cell = { year: number; month: number; day: number; type: "prev"|"cur"|"next" };
  const cells: Cell[] = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ year: y, month: m, day: daysInPrev - i, type: "prev" });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ year: viewYear, month: viewMonth, day: d, type: "cur" });
  for (let d = 1; cells.length < 42; d++) {
    const m = viewMonth === 11 ? 0  : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ year: y, month: m, day: d, type: "next" });
  }

  const yearMin = today.getFullYear() - 120;
  const yearMax = today.getFullYear() + 10;
  const years   = Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMin + i);

  const display = parsed
    ? parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <div className={cs.dp} ref={panelRef}>
      <label className={s.label}>{label}</label>
      <button type="button"
        className={`${cs.dpTrigger} ${open ? cs.dpTriggerOpen : ""}`}
        onClick={openPicker}
      >
        <span className={display ? cs.dpValue : cs.dpPlaceholder}>{display || "Select date"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {open && (
        <div className={cs.dpPanel}>

          {/* ── Days view ── */}
          {mode === "days" && (
            <>
              <div className={cs.dpHeader}>
                <button type="button" className={cs.dpNav} onClick={prevMonth} aria-label="Previous month">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" className={cs.dpHeadBtn} onClick={() => setMode("months")}>{MONTHS[viewMonth]}</button>
                <button type="button" className={cs.dpHeadBtn} onClick={() => setMode("years")}>{viewYear}</button>
                <button type="button" className={cs.dpNav} onClick={nextMonth} aria-label="Next month">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <div className={cs.dpDayNames}>
                {DAYS_SHORT.map(d => <span key={d} className={cs.dpDayName}>{d}</span>)}
              </div>
              <div className={cs.dpGrid}>
                {cells.map((cell, i) => {
                  const str = `${cell.year}-${String(cell.month+1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}`;
                  const isSelected = value === str;
                  const isToday    = today.getFullYear() === cell.year && today.getMonth() === cell.month && today.getDate() === cell.day;
                  const disabled   = (max ? str > max : false) || (min ? str < min : false);
                  return (
                    <button key={i} type="button" disabled={disabled}
                      onClick={() => select(cell.year, cell.month, cell.day)}
                      className={[
                        cs.dpDay,
                        cell.type !== "cur"          ? cs.dpDayOther    : "",
                        isSelected                   ? cs.dpDaySelected : "",
                        isToday && !isSelected       ? cs.dpDayToday    : "",
                      ].filter(Boolean).join(" ")}
                    >{cell.day}</button>
                  );
                })}
              </div>
              <button type="button" className={cs.dpTodayBtn}
                onClick={() => select(today.getFullYear(), today.getMonth(), today.getDate())}>
                Today
              </button>
            </>
          )}

          {/* ── Months view ── */}
          {mode === "months" && (
            <>
              <div className={cs.dpHeader}>
                <button type="button" className={cs.dpNav} onClick={() => setViewYear(y => y - 1)} aria-label="Previous year">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" className={cs.dpHeadBtn} onClick={() => setMode("years")}>{viewYear}</button>
                <button type="button" className={cs.dpNav} onClick={() => setViewYear(y => y + 1)} aria-label="Next year">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <div className={cs.dpMonthGrid}>
                {MONTHS.map((m, i) => (
                  <button key={m} type="button"
                    className={`${cs.dpMonthBtn} ${i === viewMonth ? cs.dpMonthActive : ""}`}
                    onClick={() => { setViewMonth(i); setMode("days"); }}>
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Years view ── */}
          {mode === "years" && (
            <>
              <div className={cs.dpHeader}>
                <span className={cs.dpHeadLabel}>Select Year</span>
                <button type="button" className={cs.dpNav} onClick={() => setMode("months")} aria-label="Back to months">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              </div>
              <div className={cs.dpYearGrid} ref={yearGridRef}>
                {years.map(yr => (
                  <button key={yr} type="button"
                    data-active={yr === viewYear ? "true" : undefined}
                    className={`${cs.dpYearBtn} ${yr === viewYear ? cs.dpYearActive : ""}`}
                    onClick={() => { setViewYear(yr); setMode("months"); }}>
                    {yr}
                  </button>
                ))}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

/* ── Result types ───────────────────────────────────────── */
interface AgeResult {
  years: number; months: number; days: number;
  totalDays: number; totalMonths: number;
  nextBirthday: number; dayOfWeek: string;
}
interface DiffResult {
  totalDays: number; years: number; months: number; days: number;
  weeks: number; weekdays: number; weekends: number;
}

/* ── Main component ─────────────────────────────────────── */
const AgeCalculator = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [mode, setMode] = useState<"age"|"diff">("age");

  /* Live tick for diff mode when dateB is today */
  const [nowMs, setNowMs] = useState(() => Date.now());

  /* Age mode */
  const [dob,    setDob]    = useState("");
  const [toDate, setToDate] = useState(todayStr);
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);

  /* Days-between mode */
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState(todayStr);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  const calcAge = () => {
    if (!dob) return;
    const birth = new Date(dob + "T00:00:00");
    const to    = new Date(toDate + "T00:00:00");
    if (birth > to) return;

    let years  = to.getFullYear() - birth.getFullYear();
    let months = to.getMonth()    - birth.getMonth();
    let days   = to.getDate()     - birth.getDate();
    if (days < 0)   { months--; days   += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
    if (months < 0) { years--;  months += 12; }

    const totalDays   = Math.floor((to.getTime() - birth.getTime()) / 86400000);
    const totalMonths = years * 12 + months;
    const next = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
    if (next <= to) next.setFullYear(next.getFullYear() + 1);

    setAgeResult({ years, months, days, totalDays, totalMonths,
      nextBirthday: Math.ceil((next.getTime() - to.getTime()) / 86400000),
      dayOfWeek: WEEK_DAYS[birth.getDay()] });
  };

  const calcDiff = () => {
    if (!dateA || !dateB) return;
    const a = new Date(dateA + "T00:00:00");
    const b = new Date(dateB + "T00:00:00");
    const [start, end] = a <= b ? [a, b] : [b, a];
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);

    let years  = end.getFullYear() - start.getFullYear();
    let months = end.getMonth()    - start.getMonth();
    let days   = end.getDate()     - start.getDate();
    if (days < 0)   { months--; days   += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
    if (months < 0) { years--;  months += 12; }

    let weekdays = 0, weekends = 0;
    const cur = new Date(start);
    while (cur < end) {
      const dow = cur.getDay();
      if (dow === 0 || dow === 6) weekends++; else weekdays++;
      cur.setDate(cur.getDate() + 1);
    }
    setNowMs(Date.now());
    setDiffResult({ totalDays, years, months, days, weeks: Math.floor(totalDays / 7), weekdays, weekends });
  };

  /* Start/stop live tick when age result is showing and toDate is today */
  useEffect(() => {
    if (mode !== "age" || !ageResult || toDate !== todayStr) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [mode, ageResult, toDate, todayStr]);

  return (
    <ToolPageShell
      backTo="/calculators" backLabel="Calculators"
      icon={<Icon />} iconColor="#059669" iconBg="#ecfdf5"
      title="Age & Date Calculator"
      description="Calculate exact age or find the live duration between any two dates."
    >
      <div className={`${s.workspace} ${s.workspaceSplit}`}>
        <div className={s.card}>
          <div className={s.chipRow}>
            <button className={`${s.chip} ${mode === "age"  ? s.chipActive : ""}`}
              onClick={() => { setMode("age");  setAgeResult(null); }}>Age Calculator</button>
            <button className={`${s.chip} ${mode === "diff" ? s.chipActive : ""}`}
              onClick={() => { setMode("diff"); setDiffResult(null); }}>Days Between Dates</button>
          </div>

          {mode === "age" ? (
            <>
              <DatePicker value={dob}    onChange={setDob}    label="Date of Birth" max={toDate} />
              <DatePicker value={toDate} onChange={setToDate} label="Age as of" />
              <button className={s.calcBtn} onClick={calcAge}>Calculate Age</button>
            </>
          ) : (
            <>
              <DatePicker value={dateA} onChange={setDateA} label="From Date" />
              <DatePicker value={dateB} onChange={setDateB} label="To Date"   />
              <button className={s.calcBtn} onClick={calcDiff}>Calculate Difference</button>
            </>
          )}
        </div>

        {mode === "age" && ageResult && (() => {
          const startMs = dob ? new Date(dob + "T00:00:00").getTime() : 0;
          const endMs   = toDate === todayStr ? nowMs : new Date(toDate + "T00:00:00").getTime();
          const liveMs  = Math.max(0, endMs - startMs);
          const liveH   = Math.floor(liveMs / 3600000);
          const liveM   = Math.floor((liveMs % 3600000) / 60000);
          const liveS   = Math.floor((liveMs % 60000) / 1000);
          const isLive  = toDate === todayStr;
          return (
          <div className={s.card}>
            <span className={s.cardTitle}>Your Age</span>
            <div className={`${s.resultGrid} ${s.resultGrid3}`}>
              <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
                <div className={s.resultValue}>{ageResult.years}</div>
                <div className={s.resultLabel}>Years</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardBlue}`}>
                <div className={s.resultValue}>{ageResult.months}</div>
                <div className={s.resultLabel}>Months</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{ageResult.days}</div>
                <div className={s.resultLabel}>Days</div>
              </div>
            </div>
            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={s.resultCard}>
                <div className={s.resultValue}>{ageResult.totalDays.toLocaleString()}</div>
                <div className={s.resultLabel}>Total Days Lived</div>
              </div>
              <div className={s.resultCard}>
                <div className={s.resultValue}>{ageResult.totalMonths}</div>
                <div className={s.resultLabel}>Total Months</div>
              </div>
            </div>

            {/* Live H : M : S counter */}
            <div className={s.cardTitle} style={{ marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {isLive && (
                <span style={{
                  display: "inline-block", width: 8, height: 8,
                  borderRadius: "50%", background: "#059669",
                  boxShadow: "0 0 6px #059669", flexShrink: 0,
                }} />
              )}
              {isLive ? "Live Age" : "Age in Time"}
            </div>
            <div className={`${s.resultGrid} ${s.resultGrid3}`}>
              <div className={`${s.resultCard} ${s.resultCardBlue}`}>
                <div className={s.resultValue}>{liveH.toLocaleString()}</div>
                <div className={s.resultLabel}>Hours</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{liveM}</div>
                <div className={s.resultLabel}>Minutes</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardOrange}`}>
                <div className={s.resultValue}>{liveS}</div>
                <div className={s.resultLabel}>Seconds</div>
              </div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid2}`}>
              <div className={`${s.resultCard} ${s.resultCardOrange}`}>
                <div className={s.resultValue}>{ageResult.nextBirthday}</div>
                <div className={s.resultLabel}>Days Until Birthday</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardYellow}`}>
                <div className={s.resultValue}>{ageResult.dayOfWeek}</div>
                <div className={s.resultLabel}>Born On</div>
              </div>
            </div>
          </div>
          );
        })()}

        {mode === "diff" && diffResult && (() => {
          return (
          <div className={s.card}>
            <span className={s.cardTitle}>Duration</span>
            <div className={`${s.resultCard} ${s.resultCardPrimary}`}>
              <div className={`${s.resultValue} ${s.resultValueLg}`}>{diffResult.totalDays.toLocaleString()}</div>
              <div className={s.resultLabel}>Total Days</div>
            </div>
            <div className={`${s.resultGrid} ${s.resultGrid3}`}>
              <div className={s.resultCard}>
                <div className={s.resultValue}>{diffResult.years}</div>
                <div className={s.resultLabel}>Years</div>
              </div>
              <div className={s.resultCard}>
                <div className={s.resultValue}>{diffResult.months}</div>
                <div className={s.resultLabel}>Months</div>
              </div>
              <div className={s.resultCard}>
                <div className={s.resultValue}>{diffResult.days}</div>
                <div className={s.resultLabel}>Rem. Days</div>
              </div>
            </div>

            <div className={`${s.resultGrid} ${s.resultGrid3}`}>
              <div className={`${s.resultCard} ${s.resultCardBlue}`}>
                <div className={s.resultValue}>{diffResult.weeks.toLocaleString()}</div>
                <div className={s.resultLabel}>Weeks</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardGreen}`}>
                <div className={s.resultValue}>{diffResult.weekdays.toLocaleString()}</div>
                <div className={s.resultLabel}>Weekdays</div>
              </div>
              <div className={`${s.resultCard} ${s.resultCardOrange}`}>
                <div className={s.resultValue}>{diffResult.weekends.toLocaleString()}</div>
                <div className={s.resultLabel}>Weekends</div>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </ToolPageShell>
  );
};

export default AgeCalculator;
