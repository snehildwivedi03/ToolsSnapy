import { useState, useRef, useCallback } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import {
  jsonValidatorApi,
  getApiError,
} from "../../../services/textApi";
import type { JsonValidatorData } from "../../../services/textApi";
import s from "../../../styles/toolpage.module.css";

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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const JsonValidator = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<JsonValidatorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = text === "" ? [""] : text.split("\n");
  const errorLine = result?.line;

  const handleScroll = useCallback(() => {
    if (taRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  }, []);

  const handleValidate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await jsonValidatorApi(text);
      setResult(res.data.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const jumpToError = () => {
    if (!taRef.current || !errorLine) return;
    const el = taRef.current;
    const lineH = el.scrollHeight / lines.length;
    const targetTop = Math.max(0, (errorLine - 1) * lineH - el.clientHeight / 3);
    el.scrollTo({ top: targetTop, behavior: "smooth" });
    gutterRef.current?.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  return (
    <ToolPageShell
      backTo="/text"
      backLabel="Text Tools"
      icon={<JsonIcon />}
      iconColor="#2563eb"
      iconBg="#eff6ff"
      title="JSON Validator"
      description="Check whether your JSON is valid and see detailed error messages."
    >
      <div className={s.workspaceSingle}>
        {/* Input */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Input JSON</span>

          {/* Line-number gutter + textarea */}
          <div className={s.lineNumContainer}>
            <div className={s.lineGutter} ref={gutterRef} aria-hidden="true">
              {lines.map((_, i) => (
                <div
                  key={i}
                  className={
                    errorLine === i + 1
                      ? `${s.lineNum} ${s.lineNumError}`
                      : s.lineNum
                  }
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={taRef}
              className={s.lineGutterTextarea}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
                setError(null);
              }}
              onScroll={handleScroll}
              placeholder='{"name":"Alice","valid":true}'
              aria-label="Input JSON"
              spellCheck={false}
              rows={10}
            />
          </div>

          <div className={s.actions}>
            <button
              className={s.btnPrimary}
              onClick={handleValidate}
              disabled={loading || !text.trim()}
            >
              {loading ? "Validating..." : "Validate JSON"}
            </button>
            <button className={s.btnSecondary} onClick={handleClear}>
              Clear
            </button>
          </div>
          {error !== null && <p className={s.error}>{error}</p>}
        </div>

        {/* Result */}
        {result !== null && (
          <div className={s.panel}>
            <span className={s.panelLabel}>Result</span>

            {result.valid ? (
              <div className={s.resultValid}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <p className={s.resultTitle}>Valid JSON</p>
                  <p style={{ fontSize: "0.875rem", marginTop: "2px" }}>
                    Well-formed and syntactically correct.
                  </p>
                </div>
              </div>
            ) : (
              <div className={s.resultInvalid}>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <p className={s.resultTitle}>Invalid JSON</p>
                </div>
                {result.error !== undefined && (
                  <pre className={s.resultError}>{result.error}</pre>
                )}
                {errorLine !== undefined && (
                  <button className={s.jumpToErrorBtn} onClick={jumpToError}>
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
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                    Jump to line {errorLine}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default JsonValidator;
