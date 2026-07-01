import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shareText } from "../../services/shareApi";
import { incrementTexts } from "../../services/shareCounter";
import tp from "../../styles/toolpage.module.css";
import s from "./ShareTextViaToolSnapy.module.css";

interface Props {
  /** The text to share when the button is clicked. */
  getText: () => string | Promise<string>;
  disabled?: boolean;
}

/** "Share via ToolSnapy" button for sharing text content. */
const ShareTextViaToolSnapy = ({ getText, disabled }: Props) => {
  const [sharing, setSharing] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const share = async () => {
    setErr("");
    setCode(null);
    setSharing(true);
    try {
      const text = await getText();
      if (!text.trim()) {
        setErr("No text to share.");
        setSharing(false);
        return;
      }
      const res = await shareText(text);
      if (res.success && res.code) {
        setCode(res.code);
        incrementTexts();
      } else {
        setErr(res.message ?? "We couldn't share that. Please try again.");
      }
    } catch {
      setErr("Something went wrong while sharing. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button
        type="button"
        className={s.shareBtn}
        onClick={share}
        disabled={disabled || sharing}
      >
        {sharing ? (
          <>
            <span className={s.spinner} aria-hidden="true" />
            Sharing…
          </>
        ) : (
          <>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share via ToolSnapy
          </>
        )}
      </button>

      {err && <p className={s.errorMsg}>{err}</p>}

      {code && (
        <div className={s.shareResult}>
          <span className={s.shareCodeLabel}>Share Code</span>
          <span className={s.shareCodeValue}>{code}</span>
          <div className={s.shareActions}>
            <button
              style={{ minWidth: "7.5rem" }}
              className={
                copied ? `${tp.btnSecondary} ${tp.btnCopied}` : tp.btnSecondary
              }
              onClick={copyCode}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
            <button
              className={s.receiveBtn}
              onClick={() => navigate("/share/receive")}
            >
              Open Receive Page
            </button>
          </div>
          <span className={s.shareExpiry}>Expires in 15 minutes</span>
        </div>
      )}
    </>
  );
};

export default ShareTextViaToolSnapy;
