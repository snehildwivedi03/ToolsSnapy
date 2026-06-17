import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shareFiles } from "../../../services/shareApi";
import { incrementFiles } from "../../../services/shareCounter";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import tp from "../../../styles/toolpage.module.css";
import ls from "./imageTools.module.css";

interface Props {
  /** Produce the File to share when the button is clicked. */
  getFile: () => File | Promise<File>;
  /** Which share bucket to upload to. Defaults to "images". */
  kind?: "files" | "images" | "pdfs";
  disabled?: boolean;
}

/** "Share via ToolsSnapy" button + result card, reused across image and PDF tools. */
const ShareViaToolSnapy = ({ getFile, kind = "images", disabled }: Props) => {
  const [sharing, setSharing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const share = async () => {
    setErr("");
    setCode(null);
    setProgress(0);
    setSharing(true);
    try {
      const file = await getFile();
      const res = await shareFiles([file], kind, undefined, setProgress);
      if (res.success && res.code) {
        setCode(res.code);
        incrementFiles();
      } else {
        setErr(res.message ?? "We couldn't share that. Please try again.");
      }
    } catch {
      setErr("Could not share. Try again.");
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
        className={ls.shareBtn}
        onClick={share}
        disabled={disabled || sharing}
      >
        {sharing ? (
          <>
            <span className={ls.spinner} aria-hidden="true" />
            Sharing…
          </>
        ) : (
          <>
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share via ToolsSnapy
          </>
        )}
      </button>

      {sharing && (
        <ProgressBar value={progress} tone="amber" label="Uploading…" />
      )}

      {err && <p className={ls.errorMsg}>{err}</p>}

      {code && (
        <div className={ls.shareResult}>
          <span className={ls.shareCodeLabel}>Share Code</span>
          <span className={ls.shareCodeValue}>{code}</span>
          <div className={ls.shareActions}>
            <button
              className={copied ? `${tp.btnSecondary} ${tp.btnCopied}` : tp.btnSecondary}
              onClick={copyCode}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
            <button className={ls.receiveBtn} onClick={() => navigate("/share/receive")}>
              Open Receive Page →
            </button>
          </div>
          <span className={ls.shareExpiry}>Expires in 15 minutes</span>
        </div>
      )}
    </>
  );
};

export default ShareViaToolSnapy;
