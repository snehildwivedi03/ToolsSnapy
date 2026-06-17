import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import s from "../../../styles/calc.module.css";
import ls from "./DevTool.module.css";

interface JwtSection { raw: string; decoded: string; valid: boolean }

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/>
    <line x1="9" y1="15" x2="12" y2="15"/>
  </svg>
);

const b64url = (s: string): string => {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(s.length + (4 - s.length % 4) % 4, "=");
  try { return JSON.stringify(JSON.parse(atob(padded)), null, 2); }
  catch { return atob(padded); }
};

const decodeJwt = (token: string): { header: JwtSection; payload: JwtSection; sig: string } | null => {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    return {
      header:  { raw: parts[0], decoded: b64url(parts[0]), valid: true },
      payload: { raw: parts[1], decoded: b64url(parts[1]), valid: true },
      sig:     parts[2],
    };
  } catch { return null; }
};

const JwtDecoder = () => {
  const [token,  setToken]  = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const result = token.trim() ? decodeJwt(token) : null;

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Developer Tools"
      icon={<Icon />}
      iconColor="#7c3aed"
      iconBg="#f5f3ff"
      title="JWT Decoder"
      description="Decode JSON Web Tokens. Inspect the header, payload and signature. Nothing is sent to a server."
    >
      <div className={s.card}>
        <span className={s.cardTitle}>JWT Token</span>
        <div className={s.inputGroup}>
          <label className={s.label} htmlFor="jwt-input">Paste your token</label>
          <textarea
            id="jwt-input"
            className={ls.textarea}
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            rows={4}
            spellCheck={false}
          />
        </div>
      </div>

      {token.trim() && !result && (
        <p className={ls.error}>Invalid JWT format. A valid token has exactly 3 Base64URL-encoded parts separated by dots.</p>
      )}

      {result && (
        <>
        <div className={ls.jwtGrid}>
          {/* Header */}
          <div className={ls.jwtSection}>
            <div className={ls.jwtSectionHead}>
              <span className={`${ls.jwtSectionTitle} ${ls.headerColor}`}>Header</span>
              <button type="button" className={`${ls.copyBtn} ${copied === "header" ? ls.copyDone : ""}`}
                onClick={() => copy(result.header.decoded, "header")}>
                {copied === "header" ? "✓" : "Copy"}
              </button>
            </div>
            <pre className={ls.jwtPre}>{result.header.decoded}</pre>
          </div>

          {/* Payload */}
          <div className={ls.jwtSection}>
            <div className={ls.jwtSectionHead}>
              <span className={`${ls.jwtSectionTitle} ${ls.payloadColor}`}>Payload</span>
              <button type="button" className={`${ls.copyBtn} ${copied === "payload" ? ls.copyDone : ""}`}
                onClick={() => copy(result.payload.decoded, "payload")}>
                {copied === "payload" ? "✓" : "Copy"}
              </button>
            </div>
            <pre className={ls.jwtPre}>{result.payload.decoded}</pre>
          </div>

          {/* Signature */}
          <div className={ls.jwtSection}>
            <div className={ls.jwtSectionHead}>
              <span className={`${ls.jwtSectionTitle} ${ls.sigColor}`}>Signature</span>
              <button type="button" className={`${ls.copyBtn} ${copied === "sig" ? ls.copyDone : ""}`}
                onClick={() => copy(result.sig, "sig")}>
                {copied === "sig" ? "✓" : "Copy"}
              </button>
            </div>
            <pre className={ls.jwtPre}>{result.sig}</pre>
          </div>
        </div>

        <ShareTextViaToolSnapy
          getText={() => `Header:\n${result.header.decoded}\n\nPayload:\n${result.payload.decoded}`}
        />
        </>
      )}

    </ToolPageShell>
  );
};

export default JwtDecoder;
