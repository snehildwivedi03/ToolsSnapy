import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./LiveClock.module.css";

const fmt = (date: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(date);

const LiveClock = () => {
  const [now, setNow]         = useState(new Date());
  const [format24, setFormat24] = useState(true);

  /* 100 ms interval keeps seconds display snappy with minimal drift */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(id);
  }, []);

  const hh = fmt(now, { hour: "2-digit",   hour12: false });
  const mm = fmt(now, { minute: "2-digit"                });
  const ss = fmt(now, { second: "2-digit"                });

  /* 12-hr needs AM/PM split */
  const hh12Raw = fmt(now, { hour: "2-digit", hour12: true });
  const hh12    = hh12Raw.replace(/\s?(AM|PM)$/i, "").padStart(2, "0");
  const ampm    = /AM/i.test(hh12Raw) ? "AM" : "PM";

  const dateStr = fmt(now, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

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

      <div className={styles.card}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          India Standard Time · UTC +5:30
        </div>

        <div className={styles.timeRow} aria-live="polite" aria-label={`Current time: ${format24 ? hh : hh12}:${mm}:${ss}${!format24 ? " " + ampm : ""}`}>
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
    </div>
  );
};

export default LiveClock;
