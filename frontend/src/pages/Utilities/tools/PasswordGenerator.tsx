import { useState, useCallback, useEffect } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import RelatedTools from "../../../components/RelatedTools/RelatedTools";
import s from "../../../styles/calc.module.css";
import ls from "./PasswordGenerator.module.css";

/* ── Constants ─────────────────────────────────────────── */
const UPPER   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER   = "abcdefghijklmnopqrstuvwxyz";
const DIGITS  = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

const getStrength = (pwd: string): { label: string; level: 0 | 1 | 2 | 3; color: string } => {
  if (pwd.length < 6)  return { label: "Weak",      level: 0, color: "#ef4444" };
  if (pwd.length < 10) return { label: "Fair",       level: 1, color: "#f97316" };
  if (pwd.length < 16) return { label: "Strong",     level: 2, color: "#22c55e" };
                       return { label: "Very Strong", level: 3, color: "#15803d" };
};

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const generate = (len: number, charset: string): string => {
  if (!charset) return "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, v => charset[v % charset.length]).join("");
};

const PasswordGenerator = () => {
  const [length,   setLength]   = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigit, setUseDigit] = useState(true);
  const [useSym,   setUseSym]   = useState(false);
  const [password, setPassword] = useState("");
  const [copied,   setCopied]   = useState(false);
  const [bulkN,    setBulkN]    = useState(5);
  const [bulk,     setBulk]     = useState<string[]>([]);
  const [copiedIdx,setCopiedIdx]= useState<number | null>(null);

  const charset = [
    useUpper ? UPPER : "",
    useLower ? LOWER : "",
    useDigit ? DIGITS : "",
    useSym   ? SYMBOLS : "",
  ].join("");

  const regen = useCallback(() => {
    setPassword(generate(length, charset));
    setCopied(false);
  }, [length, charset]);

  useEffect(() => { regen(); }, [regen]);

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBulk = async (idx: number, pwd: string) => {
    await navigator.clipboard.writeText(pwd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const genBulk = () => {
    const list = Array.from({ length: bulkN }, () => generate(length, charset));
    setBulk(list);
  };

  const strength = getStrength(password);

  // Enforce at least one charset toggle active
  const toggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    current: boolean,
  ) => {
    const activeCount = [useUpper, useLower, useDigit, useSym].filter(Boolean).length;
    if (current && activeCount === 1) return; // can't disable last one
    setter(!current);
  };

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Utilities"
      icon={<Icon />}
      iconColor="#7c3aed"
      iconBg="#f5f3ff"
      title="Password Generator"
      description="Generate strong random passwords with custom length, character sets and a live strength meter."
    >
      {/* Controls */}
      <div className={s.card}>
        <span className={s.cardTitle}>Options</span>

        {/* Length */}
        <div className={s.inputGroup}>
          <div className={ls.sliderLabelRow}>
            <label className={s.label} htmlFor="pwd-len">Length</label>
            <span className={ls.sliderVal}>{length}</span>
          </div>
          <input
            id="pwd-len"
            type="range" min={4} max={64} step={1}
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            className={ls.slider}
          />
          <div className={ls.sliderMarks}>
            <span>4</span><span>16</span><span>32</span><span>64</span>
          </div>
        </div>

        {/* Character sets */}
        <div className={s.inputGroup}>
          <label className={s.label}>Character Sets</label>
          <div className={s.chipGroup}>
            {[
              { label: "A–Z Uppercase", val: useUpper, set: setUseUpper },
              { label: "a–z Lowercase", val: useLower, set: setUseLower },
              { label: "0–9 Digits",    val: useDigit, set: setUseDigit },
              { label: "Symbols",       val: useSym,   set: setUseSym },
            ].map(({ label, val, set }) => (
              <button
                key={label}
                type="button"
                className={`${s.chip} ${val ? s.chipActive : ""}`}
                onClick={() => toggle(set, val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Password output */}
      <div className={s.card}>
        <div className={ls.pwdRow}>
          <code className={ls.pwdDisplay}>{password || "—"}</code>
          <div className={ls.pwdActions}>
            <button type="button" className={ls.iconBtn} onClick={regen} aria-label="Regenerate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button type="button" className={`${ls.copyBtn} ${copied ? ls.copyBtnDone : ""}`} onClick={copy}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Strength bar */}
        <div className={ls.strengthWrap} aria-label={`Password strength: ${strength.label}`}>
          <div className={ls.strengthBar}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={ls.strengthSeg}
                style={{ background: i <= strength.level ? strength.color : undefined }}
              />
            ))}
          </div>
          <span className={ls.strengthLabel} style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      </div>

      {/* Bulk generate */}
      <div className={s.card}>
        <span className={s.cardTitle}>Bulk Generate</span>

        <div className={ls.bulkRow}>
          <div className={s.inputGroup} style={{ flex: 1 }}>
            <div className={ls.sliderLabelRow}>
              <label className={s.label} htmlFor="bulk-n">Count</label>
              <span className={ls.sliderVal}>{bulkN}</span>
            </div>
            <input
              id="bulk-n" type="range" min={2} max={20} step={1}
              value={bulkN}
              onChange={e => setBulkN(Number(e.target.value))}
              className={ls.slider}
            />
          </div>
          <button type="button" className={s.calcBtn} onClick={genBulk}>Generate {bulkN}</button>
        </div>

        {bulk.length > 0 && (
          <ul className={ls.bulkList} role="list">
            {bulk.map((pwd, i) => (
              <li key={i} className={ls.bulkItem}>
                <code className={ls.bulkPwd}>{pwd}</code>
                <button
                  type="button"
                  className={`${ls.smallCopy} ${copiedIdx === i ? ls.smallCopyDone : ""}`}
                  onClick={() => copyBulk(i, pwd)}
                >
                  {copiedIdx === i ? "✓" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <RelatedTools currentId="password-generator" section="utilities" />
    </ToolPageShell>
  );
};

export default PasswordGenerator;
