/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import {
  jsonFormatterApi,
  getApiError,
} from "../../../services/textApi";
import s from "../../../styles/toolpage.module.css";
import Toast from "../../../components/Toast/Toast";

const JsonIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const JsonFormatter = () => {
  const [text, setText] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);

  const handleFormat = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await jsonFormatterApi(text, indent);
      setOutput(res.data.data.formattedJson);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setOutput(null);
    setError(null);
  };

  const handleCopy = async () => {
    if (output === null) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (output === null) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
    setDownloadToast(true);
  };

  return (
    <ToolPageShell
      backTo="/text"
      backLabel="Text Tools"
      icon={<JsonIcon />}
      iconColor="#2563eb"
      iconBg="#eff6ff"
      title="JSON Formatter"
      description="Paste minified or messy JSON and get a clean, indented output."
    >
      {downloadToast && <Toast message="Downloaded successfully!" onClose={() => setDownloadToast(false)} />}
      <div className={s.workspace}>
        {/* Input */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Input JSON</span>
          <textarea
            className={`${s.textarea} ${s.textareaCode}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'{"name":"Alice","age":30}'}
            aria-label="Input JSON"
            spellCheck={false}
          />

          <div className={s.indentRow}>
            <span className={s.indentLabel}>Indent:</span>
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                className={
                  indent === n
                    ? `${s.indentBtn} ${s.indentBtnActive}`
                    : s.indentBtn
                }
                onClick={() => setIndent(n)}
                aria-pressed={indent === n}
              >
                {n}
              </button>
            ))}
            <span className={s.indentLabel}>spaces</span>
          </div>

          <div className={s.actions}>
            <button
              className={s.btnPrimary}
              onClick={handleFormat}
              disabled={loading || !text.trim()}
            >
              {loading ? "Formatting..." : "Format JSON"}
            </button>
            <button className={s.btnSecondary} onClick={handleClear}>
              Clear
            </button>
          </div>
          {error !== null && <p className={s.error}>{error}</p>}
        </div>

        {/* Output */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Formatted output</span>

          {output === null ? (
            <div className={s.placeholder}>
              <span>Formatted JSON appears here</span>
              <span>Paste JSON and click Format</span>
            </div>
          ) : (
            <>
              <textarea
                className={`${s.textarea} ${s.textareaCode}`}
                value={output}
                readOnly
                aria-label="Formatted JSON"
                spellCheck={false}
              />
              <div className={s.actions}>
                <button
                  style={{ minWidth: "7.5rem" }}
                  className={
                    copied
                      ? `${s.btnSecondary} ${s.btnCopied}`
                      : s.btnSecondary
                  }
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
                <button className={s.btnSecondary} onClick={handleDownload}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download JSON
                </button>
                <ShareTextViaToolSnapy getText={() => output ?? ""} />
              </div>
            </>
          )}
        </div>
      </div>
    </ToolPageShell>
  );
};

export default JsonFormatter;
