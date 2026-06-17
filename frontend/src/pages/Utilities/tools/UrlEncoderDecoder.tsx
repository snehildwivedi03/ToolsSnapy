import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import s from "../../../styles/calc.module.css";
import ls from "./DevTool.module.css";

type Mode = "encode" | "decode";

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const safeEncode = (text: string) => {
  try { return { result: encodeURIComponent(text), error: null }; }
  catch (e) { return { result: "", error: String(e) }; }
};

const safeDecode = (text: string) => {
  try { return { result: decodeURIComponent(text), error: null }; }
  catch { return { result: "", error: "Invalid percent-encoding. The input could not be decoded." }; }
};

const UrlEncoderDecoder = () => {
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
      iconColor="#d97706"
      iconBg="#fffbeb"
      title="URL Encoder / Decoder"
      description="Encode or decode URL components using percent-encoding (RFC 3986). Runs entirely in your browser."
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
            <label className={s.label} htmlFor="url-input">
              {mode === "encode" ? "Plain URL / Text" : "Encoded URL"}
            </label>
            <textarea
              id="url-input"
              className={ls.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === "encode"
                ? "https://example.com/search?q=hello world&lang=en"
                : "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"}
              rows={6}
              spellCheck={false}
            />
          </div>

          <div className={ls.outputBlock}>
            <div className={ls.outputLabel}>
              <label className={s.label}>
                {mode === "encode" ? "Encoded Output" : "Decoded Output"}
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

        <ShareTextViaToolSnapy getText={() => result} disabled={!result} />
      </div>

    </ToolPageShell>
  );
};

export default UrlEncoderDecoder;
