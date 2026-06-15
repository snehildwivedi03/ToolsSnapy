import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import RelatedTools from "../../../components/RelatedTools/RelatedTools";
import s from "../../../styles/calc.module.css";
import ls from "./DevTool.module.css";

type Mode = "encode" | "decode";

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

const safeEncode = (text: string): { result: string; error: string | null } => {
  try { return { result: btoa(unescape(encodeURIComponent(text))), error: null }; }
  catch { return { result: "", error: "Encoding failed — ensure input is valid text." }; }
};

const safeDecode = (text: string): { result: string; error: string | null } => {
  try { return { result: decodeURIComponent(escape(atob(text.trim()))), error: null }; }
  catch { return { result: "", error: "Invalid Base64 — the input could not be decoded." }; }
};

const Base64Tool = () => {
  const [mode,   setMode]   = useState<Mode>("encode");
  const [input,  setInput]  = useState("");
  const [copied, setCopied] = useState(false);

  const { result, error } = input.trim()
    ? mode === "encode" ? safeEncode(input) : safeDecode(input)
    : { result: "", error: null };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const swap = () => {
    setMode(m => m === "encode" ? "decode" : "encode");
    setInput(result);
  };

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Developer Tools"
      icon={<Icon />}
      iconColor="#0891b2"
      iconBg="#ecfeff"
      title="Base64 Encoder / Decoder"
      description="Encode plain text to Base64 or decode Base64 strings back to readable text. Runs entirely in your browser."
    >
      <div className={s.card}>
        <span className={s.cardTitle}>Mode</span>
        <div className={s.chipGroup}>
          <button type="button" className={`${s.chip} ${mode === "encode" ? s.chipActive : ""}`}
            onClick={() => setMode("encode")}>Encode</button>
          <button type="button" className={`${s.chip} ${mode === "decode" ? s.chipActive : ""}`}
            onClick={() => setMode("decode")}>Decode</button>
        </div>
      </div>

      <div className={s.card}>
        <div className={ls.ioGrid}>
          <div className={s.inputGroup}>
            <label className={s.label} htmlFor="b64-input">
              {mode === "encode" ? "Plain Text" : "Base64 Input"}
            </label>
            <textarea
              id="b64-input"
              className={ls.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Enter text to encode…" : "Paste Base64 string…"}
              rows={6}
              spellCheck={false}
            />
          </div>

          <div className={ls.outputBlock}>
            <div className={ls.outputLabel}>
              <label className={s.label}>
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
              <button type="button" className={`${ls.copyBtn} ${copied ? ls.copyDone : ""}`}
                onClick={copy} disabled={!result}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {error
              ? <p className={ls.error}>{error}</p>
              : <textarea
                  className={`${ls.textarea} ${ls.textareaReadonly}`}
                  value={result}
                  readOnly
                  rows={6}
                />
            }
          </div>
        </div>

        <button type="button" className={s.calcBtn} onClick={swap} style={{ marginTop: "0.75rem" }}>
          ⇅ Swap Input ↔ Output
        </button>
      </div>

      <RelatedTools currentId={mode === "encode" ? "base64-encoder" : "base64-decoder"} section="developer" />
    </ToolPageShell>
  );
};

export default Base64Tool;
