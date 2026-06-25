import { useState, useRef, useCallback } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import {
  jsonValidatorApi,
  jsonRepairApi,
  getApiError,
} from "../../../services/textApi";
import type { JsonValidatorData, JsonRepairData } from "../../../services/textApi";
import s from "../../../styles/toolpage.module.css";
import Toast from "../../../components/Toast/Toast";

// ── Inline diff helpers ───────────────────────────────────────────────────────

type DiffEntry = { type: "same" | "removed" | "added"; content: string };

function diffLines(original: string, corrected: string): DiffEntry[] {
  const a = original.split("\n");
  const b = corrected.split("\n");
  const m = a.length;
  const n = b.length;

  // LCS DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? (dp[i - 1]?.[j - 1] ?? 0) + 1
          : Math.max(dp[i - 1]?.[j] ?? 0, dp[i]?.[j - 1] ?? 0);
    }
  }

  // Backtrack
  const result: DiffEntry[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: "same", content: a[i - 1] ?? "" });
      i--;
      j--;
    } else if (
      j > 0 &&
      (i === 0 || (dp[i]?.[j - 1] ?? 0) >= (dp[i - 1]?.[j] ?? 0))
    ) {
      result.unshift({ type: "added", content: b[j - 1] ?? "" });
      j--;
    } else {
      result.unshift({ type: "removed", content: a[i - 1] ?? "" });
      i--;
    }
  }
  return result;
}

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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const JsonValidator = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<JsonValidatorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [corrected, setCorrected] = useState<JsonRepairData | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [correctError, setCorrectError] = useState<string | null>(null);
  const [copiedCorrected, setCopiedCorrected] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffEntries, setDiffEntries] = useState<DiffEntry[]>([]);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = text === "" ? [""] : text.split("\n");

  // Set of error lines for gutter highlighting
  const errorLineSet = new Set(
    result?.issues?.filter((i) => i.severity === "error").map((i) => i.line) ?? [],
  );

  const handleScroll = useCallback(() => {
    if (taRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  }, []);

  const handleValidate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setCorrected(null);
    setCorrectError(null);
    setShowDiff(false);
    setDiffEntries([]);
    try {
      const res = await jsonValidatorApi(text);
      setResult(res.data.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = async () => {
    if (!text.trim()) return;
    setCorrecting(true);
    setCorrectError(null);
    try {
      const res = await jsonRepairApi(text);
      const data = res.data.data;
      setCorrected(data);
      setDiffEntries(diffLines(text, data.repairedJson));
      setShowDiff(true);
    } catch (err) {
      setCorrectError(getApiError(err));
    } finally {
      setCorrecting(false);
    }
  };

  const handleApplyCorrection = () => {
    if (!corrected) return;
    setText(corrected.repairedJson);
    setResult(null);
    setShowDiff(false);
    setDiffEntries([]);
    setCorrected(null);
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
    setCorrected(null);
    setCorrectError(null);
    setShowDiff(false);
    setDiffEntries([]);
  };

  const jumpToLine = (line: number) => {
    if (!taRef.current) return;
    const el = taRef.current;
    const lineH = el.scrollHeight / lines.length;
    const targetTop = Math.max(0, (line - 1) * lineH - el.clientHeight / 3);
    el.scrollTo({ top: targetTop, behavior: "smooth" });
    gutterRef.current?.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  const handleCopyCorrected = async () => {
    if (!corrected) return;
    await navigator.clipboard.writeText(corrected.repairedJson);
    setCopiedCorrected(true);
    setTimeout(() => setCopiedCorrected(false), 2000);
  };

  const handleDownloadCorrected = () => {
    if (!corrected) return;
    const blob = new Blob([corrected.repairedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "corrected.json";
    a.click();
    URL.revokeObjectURL(url);
    setDownloadToast(true);
  };

  const errorCount = result?.issues?.filter((i) => i.severity === "error").length ?? 0;
  const warningCount = result?.issues?.filter((i) => i.severity === "warning").length ?? 0;

  return (
    <ToolPageShell
      backTo="/text"
      backLabel="Text Tools"
      icon={<JsonIcon />}
      iconColor="#2563eb"
      iconBg="#eff6ff"
      title="JSON Validator"
      description="Check whether your JSON is valid and see all errors at once."
    >
      {downloadToast && <Toast message="Downloaded successfully!" onClose={() => setDownloadToast(false)} />}
      <div className={s.workspaceSingle}>

        {/* ── Input Panel — always shows textarea with gutter highlighting ── */}
        <div className={s.panel}>
          <span className={s.panelLabel}>
            {showDiff && corrected !== null ? "Diff View" : "Input JSON"}
          </span>

          {/* ── EDITOR: textarea normally, inline diff in diff mode ── */}
          <div className={s.lineNumContainer}>
            {showDiff && corrected !== null ? (
              /* ── Inline diff — same container, colored lines ── */
              <>
                <div className={s.lineGutter} aria-hidden="true">
                  {diffEntries.map((_, i) => (
                    <div key={i} className={s.lineNum}>{i + 1}</div>
                  ))}
                </div>
                <div className={s.diffEditorContent}>
                  {diffEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className={
                        entry.type === "removed"
                          ? s.diffEditorLineRemoved
                          : entry.type === "added"
                          ? s.diffEditorLineAdded
                          : s.diffEditorLineSame
                      }
                    >
                      <span className={s.diffPrefix} aria-hidden="true">
                        {entry.type === "removed" ? "−" : entry.type === "added" ? "+" : " "}
                      </span>
                      <span>{entry.content || "\u00a0"}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* ── Normal textarea with gutter highlighting ── */
              <>
                <div className={s.lineGutter} ref={gutterRef} aria-hidden="true">
                  {lines.map((_, i) => (
                    <div
                      key={i}
                      className={
                        errorLineSet.has(i + 1)
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
                    setCorrected(null);
                    setCorrectError(null);
                    setShowDiff(false);
                    setDiffEntries([]);
                  }}
                  onScroll={handleScroll}
                  placeholder='{"name":"Alice","valid":true}'
                  aria-label="Input JSON"
                  spellCheck={false}
                  rows={10}
                />
              </>
            )}
          </div>

          {!showDiff && (
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
          )}
          {!showDiff && error !== null && <p className={s.error}>{error}</p>}
        </div>

        {/* ── Right panel: validation results OR diff view ── */}
        {(result !== null || (showDiff && corrected !== null)) && (
          <div className={s.panel}>

            {/* ── Validation result (error list + Correct It) ── */}
            {!showDiff && result !== null && (
              <>
                <span className={s.panelLabel}>Result</span>

                {result.valid ? (
                  <div className={s.resultValid}>
                    <svg
                      width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden="true" style={{ flexShrink: 0 }}
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <svg
                        width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true" style={{ flexShrink: 0 }}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      <div>
                        <p className={s.resultTitle}>Invalid JSON</p>
                        <p style={{ fontSize: "0.8125rem", marginTop: "2px", opacity: 0.8 }}>
                          {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? "s" : ""}`}
                          {errorCount > 0 && warningCount > 0 && ", "}
                          {warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? "s" : ""}`}
                          {" found"}
                        </p>
                      </div>
                    </div>

                    {result.issues.length > 0 && (
                      <div className={s.issueList}>
                        {result.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className={
                              issue.severity === "warning"
                                ? `${s.issueItem} ${s.issueItemWarning}`
                                : s.issueItem
                            }
                          >
                            <button
                              className={
                                issue.severity === "warning"
                                  ? `${s.issueLine} ${s.issueLineWarning}`
                                  : s.issueLine
                              }
                              onClick={() => jumpToLine(issue.line)}
                              title={`Jump to line ${issue.line}`}
                            >
                              L{issue.line}
                            </button>
                            <span className={s.issueMessage}>{issue.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                      <button
                        className={s.btnPrimary}
                        onClick={handleCorrect}
                        disabled={correcting}
                      >
                        {correcting ? "Correcting..." : "Correct It"}
                      </button>
                    </div>
                    {correctError !== null && <p className={s.error}>{correctError}</p>}
                  </div>
                )}

                {result.valid && (
                  <ShareTextViaToolSnapy getText={() => text} disabled={!text.trim()} />
                )}
              </>
            )}

            {/* ── Diff correction status + actions ── */}
            {showDiff && corrected !== null && (
              <>
                <span className={s.panelLabel}>Correction Result</span>

                <div
                  className={
                    corrected.valid
                      ? s.resultCorrected
                      : `${s.resultCorrected} ${s.resultCorrectedPartial}`
                  }
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {corrected.valid ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true" style={{ flexShrink: 0 }}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true" style={{ flexShrink: 0 }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                    <div>
                      <p
                        className={s.resultTitle}
                        style={{ color: corrected.valid ? "#059669" : "#d97706" }}
                      >
                        {corrected.valid ? "Fully corrected" : "Partially corrected"}
                      </p>
                      {!corrected.valid && (
                        <p style={{ fontSize: "0.8125rem", marginTop: "2px", color: "#92400e" }}>
                          Some issues could not be auto-fixed — review manually.
                        </p>
                      )}
                    </div>
                  </div>

                  {corrected.fixes.length > 0 && (
                    <div>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                        Applied fixes:
                      </p>
                      <div className={s.fixList}>
                        {corrected.fixes.map((fix, i) => (
                          <div key={i} className={s.fixItem}>
                            <CheckIcon />
                            {fix}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={s.actions}>
                  <button className={s.btnPrimary} onClick={handleApplyCorrection}>
                    Apply correction
                  </button>
                  <button
                    className={s.btnSecondary}
                    onClick={() => { setShowDiff(false); setDiffEntries([]); }}
                  >
                    Reset
                  </button>
                  <button
                    style={{ minWidth: "7.5rem" }}
                    className={copiedCorrected ? `${s.btnSecondary} ${s.btnCopied}` : s.btnSecondary}
                    onClick={handleCopyCorrected}
                  >
                    {copiedCorrected ? "Copied!" : "Copy JSON"}
                  </button>
                  <button className={s.btnSecondary} onClick={handleDownloadCorrected}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </button>
                  <ShareTextViaToolSnapy
                    getText={() => corrected.repairedJson}
                    disabled={!corrected.repairedJson.trim()}
                  />
                </div>
              </>
            )}

          </div>
        )}

      </div>
    </ToolPageShell>
  );
};

export default JsonValidator;
