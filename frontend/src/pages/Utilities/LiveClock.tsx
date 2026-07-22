/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./LiveClock.module.css";

const fmt = (date: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(date);

function istDate(d: Date): { year: number; month: number; day: number } {
  const str = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const [year, month, day] = str.split("-").map(Number);
  return { year: year ?? 0, month: (month ?? 1) - 1, day: day ?? 1 };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildCalendar(year: number, month: number): (number | null)[][] {
  // Use setFullYear so years 0-99 are not misinterpreted as 1900-1999
  const firstD = new Date(0);
  firstD.setFullYear(year, month, 1);
  const firstDay = firstD.getDay();

  const lastD = new Date(0);
  lastD.setFullYear(year, month + 1, 0);
  const daysInMonth = lastD.getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Always pad to exactly 42 cells (6 rows × 7 cols) so height never changes
  while (cells.length < 42) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < 42; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const MIN_CAL_YEAR = 1800;

const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  const [format24, setFormat24] = useState(true);
  const [yearError, setYearError] = useState<string | null>(null);

  const today = istDate(now);
  // Max year grows by 10 for every real-world year that passes after 2026
  const maxCalYear = 2200 + Math.max(0, today.year - 2026) * 10;
  const [calYear, setCalYear] = useState(today.year);
  const [calMonth, setCalMonth] = useState(today.month);
  const [goYearInput, setGoYearInput] = useState(String(today.year));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(id);
  }, []);

  const hh = fmt(now, { hour: "2-digit", hour12: false }).padStart(2, "0");
  const mm = fmt(now, { minute: "2-digit" }).padStart(2, "0");
  const ss = fmt(now, { second: "2-digit" }).padStart(2, "0");
  const hh12Raw = fmt(now, { hour: "2-digit", hour12: true });
  const hh12 = hh12Raw.replace(/\s?(AM|PM)$/i, "").padStart(2, "0");
  const ampm = /AM/i.test(hh12Raw) ? "AM" : "PM";
  const dateStr = fmt(now, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const weeks = buildCalendar(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) {
      if (calYear <= MIN_CAL_YEAR) return;
      setCalYear(y => y - 1); setCalMonth(11);
    } else {
      setCalMonth(m => m - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      if (calYear >= maxCalYear) return;
      setCalYear(y => y + 1); setCalMonth(0);
    } else {
      setCalMonth(m => m + 1);
    }
  };
  const goToday = () => {
    const t = istDate(now);
    setCalYear(t.year);
    setCalMonth(t.month);
    setGoYearInput(String(t.year));
    setYearError(null);
  };

  const handleGoYear = () => {
    const y = parseInt(goYearInput, 10);
    if (isNaN(y)) { setGoYearInput(String(calYear)); setYearError(null); return; }
    if (y < MIN_CAL_YEAR) {
      setYearError(`Year must be ${MIN_CAL_YEAR} or later`);
    } else if (y > maxCalYear) {
      setYearError(`Year must be ${maxCalYear} or earlier`);
    } else {
      setCalYear(y);
      setYearError(null);
    }
  };

  const isToday = (d: number | null) =>
    d !== null && d === today.day && calMonth === today.month && calYear === today.year;

  const atToday = calYear === today.year && calMonth === today.month;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/utilities" className={styles.backLink} aria-label="Back to Utilities">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Utilities
        </Link>
        <Link to="/" state={{ scrollToTools: true }} className={styles.homeLink} aria-label="Go to home">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </Link>
      </div>

      <div className={styles.header}>
        <div className={styles.iconWrap} aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Live Date &amp; Time</h1>
          <p className={styles.description}>
            Real-time clock and calendar in IST (UTC +5:30) with 12/24-hour toggle.
          </p>
        </div>
      </div>

      <div className={styles.twoCardRow}>

        {/* ── Clock card ── */}
        <div className={styles.card}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            India Standard Time · UTC +5:30
          </div>

          <div className={styles.timeRow} aria-live="polite"
            aria-label={`Current time: ${format24 ? hh : hh12}:${mm}:${ss}${!format24 ? " " + ampm : ""}`}>
            <span className={styles.digits}>{format24 ? hh : hh12}</span>
            <span className={styles.colon} aria-hidden="true">:</span>
            <span className={styles.digits}>{mm}</span>
            <span className={styles.colon} aria-hidden="true">:</span>
            <span className={styles.seconds}>{ss}</span>
            {!format24 && <span className={styles.ampm}>{ampm}</span>}
          </div>

          <div className={styles.date}>{dateStr}</div>

          <div className={styles.divider} />

          <button className={styles.toggle} onClick={() => setFormat24(f => !f)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {format24 ? "Switch to 12-hour" : "Switch to 24-hour"}
          </button>
        </div>

        {/* ── Calendar card ── */}
        <div className={styles.calendarCard}>
          <div className={styles.calHeaderRow}>
            <button className={styles.calNavBtn} onClick={prevMonth} aria-label="Previous month">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className={styles.calMonthYear}>
              <select
                className={styles.calMonthSelect}
                value={calMonth}
                onChange={e => setCalMonth(Number(e.target.value))}
                aria-label="Month"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </div>
            <button className={styles.calNavBtn} onClick={nextMonth} aria-label="Next month">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className={styles.calGrid}>
            {WEEKDAY_SHORT.map(d => (
              <div key={d} className={styles.calWeekday}>{d}</div>
            ))}
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={
                    day === null
                      ? styles.calCellEmpty
                      : isToday(day)
                      ? `${styles.calCell} ${styles.calCellToday}`
                      : styles.calCell
                  }
                  aria-current={isToday(day) ? "date" : undefined}
                >
                  {day ?? ""}
                </div>
              ))
            )}
          </div>

          {/* Supported range note */}
          <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", textAlign: "center", margin: "0.25rem 0 0" }}>
            Supports years {MIN_CAL_YEAR}–{maxCalYear}
          </p>

          {/* Go to date row */}
          <div className={styles.goToRow}>
            <span className={styles.goToLabel}>Year:</span>
            <input
              type="number"
              className={styles.goToYear}
              value={goYearInput}
              onChange={e => { setGoYearInput(e.target.value); setYearError(null); }}
              onBlur={handleGoYear}
              onKeyDown={e => { if (e.key === "Enter") handleGoYear(); }}
              min={MIN_CAL_YEAR}
              max={maxCalYear}
              aria-label="Go to year"
              style={yearError ? { borderColor: "#dc2626" } : undefined}
            />
            <button
              className={styles.calTodayBtn}
              onClick={goToday}
              style={{ visibility: atToday ? "hidden" : "visible" }}
              tabIndex={atToday ? -1 : 0}
            >
              Back to today
            </button>
          </div>
          {yearError && (
            <p style={{ fontSize: "0.6875rem", color: "#dc2626", margin: "0.25rem 0 0", fontWeight: 600 }}>
              {yearError}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default LiveClock;
