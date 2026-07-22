/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useRef } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import Toast from "../../../components/Toast/Toast";
import s from "../../../styles/calc.module.css";
import t from "./ShareTool.module.css";
import tp from "../../../styles/toolpage.module.css";
import { shareText } from "../../../services/shareApi";
import { incrementTexts } from "../../../services/shareCounter";

const MAX_CHARS = 50_000;

function formatCountdown(expiresAt: number): string {
  const diff = Math.max(0, expiresAt - Date.now());
  const m = Math.floor(diff / 60_000);
  const sec = Math.floor((diff % 60_000) / 1000);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const ShareText = () => {
  const [text,       setText]       = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [result,     setResult]     = useState<{ code: string; expiresAt: number } | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [toast,      setToast]      = useState(false);
  const [, setTick]       = useState(0);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef   = useRef<HTMLDivElement>(null);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTick((n) => n + 1), 1000);
  };

  const submit = async () => {
    setError("");
    if (!text.trim()) { setError("Please enter some text to share."); return; }
    setLoading(true);
    try {
      const res = await shareText(text.trim());
      if (res.success && res.code && res.expiresAt) {
        setResult({ code: res.code, expiresAt: res.expiresAt });
        incrementTexts();
        setToast(true);
        startCountdown();
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      } else {
        setError(res.message ?? "We couldn't create your share. Please try again.");
      }
    } catch {
      setError("We couldn't connect. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const reset = () => {
    setResult(null);
    setText("");
    setError("");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const expired = result && Date.now() > result.expiresAt;

  return (
    <ToolPageShell
      backTo="/share"
      backLabel="Instant Share"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      }
      iconColor="#0284c7"
      iconBg="#e0f2fe"
      title="Share Text"
      description="Paste any text, up to 50,000 characters. Get a 6-character code. Expires in 15 minutes."
    >
      {toast && <Toast message="Text shared successfully!" onClose={() => setToast(false)} />}
      {!result ? (
        <div className={s.card}>
          <div className={s.fieldGroup}>
            <label className={s.label} htmlFor="share-text-input">
              Your text
              <span className={s.labelMeta}>{text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
            </label>
            <textarea
              id="share-text-input"
              className={s.textarea}
              rows={10}
              maxLength={MAX_CHARS}
              value={text}
              onChange={(e) => { setText(e.target.value); setError(""); }}
              placeholder="Paste your text here…"
            />
          </div>

          {error && (
            <div className={t.errorList}>
              <span className={t.errorItem}>{error}</span>
            </div>
          )}

          <button
            className={s.primaryBtn}
            onClick={submit}
            disabled={loading || !text.trim()}
          >
            {loading ? "Creating share…" : "Generate Share Code"}
          </button>
        </div>
      ) : (
        <div className={t.successBox} ref={resultRef}>
          <span className={t.successTitle}>
            {expired ? "Link Expired" : "Share Code Ready"}
          </span>
          <div className={t.codeDisplay}>{result.code}</div>
          <p className={t.successMeta}>
            {expired
              ? "This share has expired."
              : <>Expires in <span className={t.countdown}>{formatCountdown(result.expiresAt)}</span></>
            }
          </p>
          {!expired && (
            <button
              className={copied ? `${tp.btnSecondary} ${tp.btnCopied}` : tp.btnSecondary}
              onClick={copy}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
          )}
          <button className={t.shareAgainBtn} onClick={reset}>
            Share something else
          </button>
        </div>
      )}
    </ToolPageShell>
  );
};

export default ShareText;
