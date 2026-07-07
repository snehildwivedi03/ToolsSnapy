import { useState } from "react";
import { useNow } from "../useNow";
import c from "../Clock.module.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MIN_YEAR = 1800;

/** Build a 6×7 month grid, padding leading/trailing cells with null. */
function buildCalendar(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1);
  if (year >= 0 && year <= 99) first.setFullYear(year);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, r * 7 + 7));
  return rows;
}

const CalendarTab = () => {
  const now = useNow(30000);
  const today = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  const maxYear = 2200 + Math.max(0, today.year - 2026) * 10;

  const [calYear, setCalYear] = useState(today.year);
  const [calMonth, setCalMonth] = useState(today.month);
  const [goYearInput, setGoYearInput] = useState("");
  const [yearError, setYearError] = useState("");

  const rows = buildCalendar(calYear, calMonth);

  const prevMonth = () => {
    setYearError("");
    if (calMonth === 0) {
      if (calYear <= MIN_YEAR) return;
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setYearError("");
    if (calMonth === 11) {
      if (calYear >= maxYear) return;
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else setCalMonth((m) => m + 1);
  };
  const goToday = () => {
    setYearError("");
    setCalYear(today.year);
    setCalMonth(today.month);
  };
  const handleGoYear = () => {
    const y = parseInt(goYearInput, 10);
    if (isNaN(y) || y < MIN_YEAR || y > maxYear) {
      setYearError(`Enter a year between ${MIN_YEAR} and ${maxYear}.`);
      return;
    }
    setYearError("");
    setCalYear(y);
    setGoYearInput("");
  };

  const isToday = (d: number | null) =>
    d !== null && calYear === today.year && calMonth === today.month && d === today.day;
  const atToday = calYear === today.year && calMonth === today.month;

  return (
    <div className={c.calCard}>
      <div className={c.calHeader}>
        <button className={c.calNav} onClick={prevMonth} aria-label="Previous month">
          ‹
        </button>
        <div className={c.calTitle}>
          {MONTH_NAMES[calMonth]} {calYear}
        </div>
        <button className={c.calNav} onClick={nextMonth} aria-label="Next month">
          ›
        </button>
      </div>

      <div className={c.calGrid}>
        {WEEKDAY_SHORT.map((w) => (
          <div key={w} className={c.calWeekday}>
            {w}
          </div>
        ))}
        {rows.flat().map((d, i) => (
          <div
            key={i}
            className={`${c.calDay} ${d === null ? c.calEmpty : ""} ${
              isToday(d) ? c.calToday : ""
            }`}
          >
            {d ?? ""}
          </div>
        ))}
      </div>

      <div className={c.calFoot}>
        <button
          className={`${c.btn} ${c.btnGhost}`}
          onClick={goToday}
          disabled={atToday}
        >
          Today
        </button>
        <div className={c.goYear}>
          <input
            className={c.textInput}
            type="number"
            placeholder="Jump to year"
            value={goYearInput}
            onChange={(e) => setGoYearInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGoYear()}
            aria-label="Jump to year"
          />
          <button className={`${c.btn} ${c.btnPrimary}`} onClick={handleGoYear}>
            Go
          </button>
        </div>
      </div>
      {yearError && <p className={c.calError}>{yearError}</p>}
    </div>
  );
};

export default CalendarTab;
