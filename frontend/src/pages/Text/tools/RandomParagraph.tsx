/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useRef, useEffect } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import ShareTextViaToolSnapy from "../../../components/ShareTextViaToolSnapy/ShareTextViaToolSnapy";
import {
  randomParagraphApi,
  getApiError,
} from "../../../services/textApi";
import s from "../../../styles/toolpage.module.css";

const MAX = 20;

const ParagraphIcon = () => (
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
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="15" y2="18" />
  </svg>
);

const RandomParagraph = () => {
  const [raw, setRaw] = useState("3");
  const [paragraphs, setParagraphs] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the output textarea to fit its content
  useEffect(() => {
    const ta = outputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [paragraphs]);

  // Derived values   never mutate state just for these
  const numericValue = parseInt(raw, 10);
  const isOverMax = !isNaN(numericValue) && numericValue > MAX;
  const isValid =
    !isNaN(numericValue) && numericValue >= 1 && numericValue <= MAX;
  const safeCount = isValid ? numericValue : 3;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits
    const val = e.target.value.replace(/[^0-9]/g, "");
    setRaw(val === "" ? "" : val);
  };

  const step = (delta: number) => {
    const current = isNaN(numericValue) ? 0 : numericValue;
    const next = Math.min(MAX, Math.max(1, current + delta));
    setRaw(String(next));
  };

  const handleGenerate = async () => {
    if (!isValid) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await randomParagraphApi(safeCount);
      setParagraphs(res.data.data.paragraphs);
    } catch (err) {
      setApiError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (paragraphs === null) return;
    await navigator.clipboard.writeText(paragraphs.join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolPageShell
      backTo="/text"
      backLabel="Text Tools"
      icon={<ParagraphIcon />}
      iconColor="#2563eb"
      iconBg="#eff6ff"
      title="Random Paragraph Generator"
      description="Type how many Lorem Ipsum paragraphs you need (up to 20) and generate instantly."
    >
      <div className={s.workspaceSingle}>
        {/* Controls */}
        <div className={s.panel}>
          <span className={s.panelLabel}>
            How many paragraphs? (max 20)
          </span>

          <div className={s.numberInputRow}>
            <div className={s.stepper}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={raw}
                onChange={handleInput}
                placeholder="3"
                aria-label="Number of paragraphs"
                aria-invalid={isOverMax}
                className={
                  isOverMax
                    ? `${s.numberInput} ${s.numberInputError}`
                    : s.numberInput
                }
              />
              <div className={s.stepperBtns}>
                <button
                  type="button"
                  className={s.stepperBtn}
                  onClick={() => step(1)}
                  disabled={!isNaN(numericValue) && numericValue >= MAX}
                  aria-label="Increase"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={s.stepperBtn}
                  onClick={() => step(-1)}
                  disabled={isNaN(numericValue) || numericValue <= 1}
                  aria-label="Decrease"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>
            <span className={s.numberHint}>
              {isOverMax
                ? "⚠ Maximum 20 paragraphs"
                : "Enter a number between 1 and 20"}
            </span>
          </div>

          {/* Inline over-limit banner */}
          {isOverMax && (
            <div className={s.maxWarning}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Maximum is 20 paragraphs. We will generate 20 for you.
            </div>
          )}

          <div className={s.actionsStack}>
            <div className={s.actionGroup}>
              <button
                className={s.btnPrimary}
                onClick={handleGenerate}
                disabled={loading || raw === "" || numericValue < 1}
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              {paragraphs !== null && (
                <button
                  className={s.btnSecondary}
                  onClick={handleGenerate}
                  disabled={loading || raw === "" || numericValue < 1}
                >
                  Regenerate
                </button>
              )}
            </div>
            {paragraphs !== null && (
              <button
                className={
                  copied
                    ? `${s.btnSecondary} ${s.btnCopied}`
                    : s.btnSecondary
                }
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy all"}
              </button>
            )}
            {paragraphs !== null && (
              <ShareTextViaToolSnapy getText={() => paragraphs.join("\n\n")} />
            )}
          </div>

          {apiError !== null && (
            <p className={s.error}>{apiError}</p>
          )}
        </div>

        {/* Output */}
        {paragraphs !== null && (
          <div className={s.panel}>
            <span className={s.panelLabel}>
              {paragraphs.length === 1
                ? "1 paragraph generated"
                : `${paragraphs.length} paragraphs generated`}
            </span>
            <textarea
              ref={outputRef}
              className={s.textarea}
              value={paragraphs.join("\n\n")}
              readOnly
              style={{ overflow: "hidden", resize: "none" }}
              aria-label="Generated Lorem Ipsum paragraphs"
            />
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default RandomParagraph;