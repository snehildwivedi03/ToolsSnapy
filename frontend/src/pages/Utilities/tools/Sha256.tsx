/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useEffect } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import s from "../../../styles/calc.module.css";
import ls from "./DevTool.module.css";

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const Sha256 = () => {
  const [input, setInput] = useState("");
  const [hash,  setHash]  = useState("");
  const [upper, setUpper] = useState(false);
  const [copied,setCopied]= useState(false);

  useEffect(() => {
    if (!input.trim()) { setHash(""); return; }
    const enc = new TextEncoder();
    crypto.subtle.digest("SHA-256", enc.encode(input)).then(buf => {
      const hex = Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0")).join("");
      setHash(upper ? hex.toUpperCase() : hex);
    });
  }, [input, upper]);

  const copy = async () => {
    if (!hash) return;
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Developer Tools"
      icon={<Icon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="SHA-256 Hash Generator"
      description="Generate a SHA-256 hash from any text using the browser's Web Crypto API. Nothing leaves your device."
    >
      <div className={s.card}>
        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="sha-input">Input Text</label>
          <textarea
            id="sha-input"
            className={ls.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter text to hash…"
            rows={5}
            spellCheck={false}
          />
        </div>

        <div className={s.chipGroup} style={{ marginTop: "0.5rem" }}>
          <button type="button" className={`${s.chip} ${!upper ? s.chipActive : ""}`}
            onClick={() => setUpper(false)}>Lowercase</button>
          <button type="button" className={`${s.chip} ${upper ? s.chipActive : ""}`}
            onClick={() => setUpper(true)}>Uppercase</button>
        </div>
      </div>

      {hash && (
        <div className={s.card}>
          <div className={ls.outputLabel} style={{ marginBottom: "0.5rem" }}>
            <span className={s.label}>SHA-256 Hash</span>
            <button type="button" className={`${ls.copyBtn} ${copied ? ls.copyDone : ""}`} onClick={copy}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className={ls.hashDisplay}>{hash}</div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem", fontWeight: 600 }}>
            256-bit · 64 hex chars · SHA-2 family
          </p>

          <ShareTextViaToolSnapy getText={() => hash} disabled={!hash} />
        </div>
      )}

    </ToolPageShell>
  );
};

export default Sha256;
