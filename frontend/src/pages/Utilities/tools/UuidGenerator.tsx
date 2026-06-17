import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import s from "../../../styles/calc.module.css";
import ls from "./UuidGenerator.module.css";

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const genUUID = (): string => crypto.randomUUID();

const UuidGenerator = () => {
  const [count,    setCount]    = useState(5);
  const [uuids,    setUuids]    = useState<string[]>(() => Array.from({ length: 5 }, genUUID));
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll,setCopiedAll]= useState(false);
  const [upper,    setUpper]    = useState(false);

  const fmt = (u: string) => upper ? u.toUpperCase() : u;

  const generate = () =>
    setUuids(Array.from({ length: count }, genUUID));

  const copy = async (i: number) => {
    await navigator.clipboard.writeText(fmt(uuids[i]));
    setCopiedId(i);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.map(fmt).join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Utilities"
      icon={<Icon />}
      iconColor="#0891b2"
      iconBg="#ecfeff"
      title="UUID Generator"
      description="Generate v4 UUIDs (RFC 4122) using the browser's cryptographically secure random API."
    >
      <div className={s.card}>
        <span className={s.cardTitle}>Options</span>

        <div className={ls.optRow}>
          <div className={s.inputGroup} style={{ flex: 1 }}>
            <label className={s.label} htmlFor="uuid-count">How many</label>
            <input
              id="uuid-count"
              className={s.input} type="number"
              min={1} max={100} value={count}
              onChange={e => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            />
          </div>

          <div className={ls.toggleWrap}>
            <label className={ls.toggleLabel}>
              <input
                type="checkbox" checked={upper}
                onChange={e => setUpper(e.target.checked)}
                className={ls.toggleInput}
              />
              <span className={ls.toggleTrack} aria-hidden="true" />
              Uppercase
            </label>
          </div>
        </div>

        <div className={ls.btnRow}>
          <button type="button" className={s.calcBtn} onClick={generate}>
            Generate
          </button>
          <button
            type="button"
            className={`${ls.copyAllBtn} ${copiedAll ? ls.copyAllDone : ""}`}
            onClick={copyAll}
          >
            {copiedAll ? "Copied all!" : "Copy all"}
          </button>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardTitle}>{uuids.length} UUIDs</span>
        <ul className={ls.list} role="list">
          {uuids.map((u, i) => (
            <li key={i} className={ls.item}>
              <code className={ls.code}>{fmt(u)}</code>
              <button
                type="button"
                className={`${ls.copyBtn} ${copiedId === i ? ls.copyDone : ""}`}
                onClick={() => copy(i)}
              >
                {copiedId === i ? "✓" : "Copy"}
              </button>
            </li>
          ))}
        </ul>

        <ShareTextViaToolSnapy
          getText={() => uuids.map(fmt).join("\n")}
          disabled={uuids.length === 0}
        />
      </div>

    </ToolPageShell>
  );
};

export default UuidGenerator;
