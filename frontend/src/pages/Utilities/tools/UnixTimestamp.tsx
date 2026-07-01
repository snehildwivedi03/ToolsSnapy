import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import s from "../../../styles/calc.module.css";
import ls from "./DevTool.module.css";
import ts from "./UnixTimestamp.module.css";

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const pad = (n: number) => String(n).padStart(2, "0");

const toISO = (ts: number) => new Date(ts * 1000).toISOString();
const toLocal = (ts: number) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
const toReadable = (ts: number) =>
  new Date(ts * 1000).toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

const dateToUnix = (dateStr: string): number | null => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
};

const UnixTimestamp = () => {
  const [ts,         setTs]         = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput,  setDateInput]  = useState("");
  const [copiedKey,  setCopiedKey]  = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const tsNum = parseInt(ts);
  const isValidTs = !isNaN(tsNum) && ts.trim() !== "";
  const tsMs = isValidTs ? tsNum * 1000 : NaN;
  const tsDate = isValidTs ? new Date(tsMs) : null;

  const unixFromDate = dateInput.trim() ? dateToUnix(dateInput) : null;

  const useNow = () => setTs(String(Math.floor(Date.now() / 1000)));

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Developer Tools"
      icon={<Icon />}
      iconColor="#6f4e37"
      iconBg="#faf6f1"
      title="Unix Timestamp Converter"
      description="Convert between Unix timestamps (seconds since epoch) and human-readable dates."
    >
      {/* Timestamp → Date */}
      <div className={s.card}>
        <span className={s.cardTitle}>Timestamp → Human Date</span>

        <div className={ts.rowWrap}>
          <div className={s.inputGroup} style={{ flex: 1 }}>
            <label className={s.label} htmlFor="unix-ts">Unix Timestamp (seconds)</label>
            <input
              id="unix-ts" className={s.input} type="number"
              value={ts} onChange={e => setTs(e.target.value)}
            />
          </div>
          <button type="button" className={ts.nowBtn} onClick={useNow}>Now</button>
        </div>

        {isValidTs && tsDate && !isNaN(tsDate.getTime()) && (
          <ul className={ts.resultList}>
            {[
              { label: "ISO 8601 (UTC)",  value: toISO(tsNum),      key: "iso"   },
              { label: "Local DateTime",  value: toLocal(tsNum),     key: "local" },
              { label: "Readable",        value: toReadable(tsNum),  key: "read"  },
              { label: "Milliseconds",    value: String(tsNum * 1000), key: "ms"  },
            ].map(row => (
              <li key={row.key} className={ts.resultRow}>
                <span className={ts.resultLabel}>{row.label}</span>
                <code className={ts.resultVal}>{row.value}</code>
                <button type="button"
                  className={`${ls.copyBtn} ${copiedKey === row.key ? ls.copyDone : ""}`}
                  onClick={() => copy(row.value, row.key)}>
                  {copiedKey === row.key ? "✓" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Date → Timestamp */}
      <div className={s.card}>
        <span className={s.cardTitle}>Date / Time → Timestamp</span>
        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="date-input">Date & Time</label>
          <input
            id="date-input" className={s.input} type="datetime-local"
            value={dateInput} onChange={e => setDateInput(e.target.value)}
          />
        </div>
        {unixFromDate !== null && (
          <div className={ts.unixResult}>
            <span className={s.label}>Unix Timestamp</span>
            <div className={ts.unixDisplay}>
              <code className={ts.unixCode}>{unixFromDate}</code>
              <button type="button"
                className={`${ls.copyBtn} ${copiedKey === "unix" ? ls.copyDone : ""}`}
                onClick={() => copy(String(unixFromDate), "unix")}>
                {copiedKey === "unix" ? "✓" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {isValidTs && tsDate && !isNaN(tsDate.getTime()) && (
        <ShareTextViaToolSnapy
          getText={() => `ISO 8601 (UTC): ${toISO(tsNum)}\nLocal: ${toLocal(tsNum)}\nReadable: ${toReadable(tsNum)}\nMilliseconds: ${tsNum * 1000}`}
        />
      )}

    </ToolPageShell>
  );
};

export default UnixTimestamp;
