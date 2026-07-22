/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import {
  characterCountApi,
  getApiError,
} from "../../../services/textApi";
import type { CharCountData } from "../../../services/textApi";
import s from "../../../styles/toolpage.module.css";

const TextIcon = () => (
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
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
);

const CharacterCounter = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CharCountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCount = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await characterCountApi(text);
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

  return (
    <ToolPageShell
      backTo="/text"
      backLabel="Text Tools"
      icon={<TextIcon />}
      iconColor="#2563eb"
      iconBg="#eff6ff"
      title="Character Counter"
      description="Count total characters, letters, digits, and whitespace."
    >
      <div className={s.workspace}>
        {/* Input */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Your text</span>
          <textarea
            className={s.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            aria-label="Text input"
          />
          <div className={s.actions}>
            <button
              className={s.btnPrimary}
              onClick={handleCount}
              disabled={loading}
            >
              {loading ? "Counting..." : "Count characters"}
            </button>
            <button className={s.btnSecondary} onClick={handleClear}>
              Clear
            </button>
          </div>
          {error !== null && <p className={s.error}>{error}</p>}
        </div>

        {/* Results */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Results</span>

          {result === null ? (
            <div className={s.placeholder}>
              <span>Results appear here</span>
              <span>Enter text and click Count characters</span>
            </div>
          ) : (
            <div className={s.stats}>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.characters.toLocaleString()}
                </span>
                <span className={s.statLabel}>Total</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.charactersNoSpaces.toLocaleString()}
                </span>
                <span className={s.statLabel}>No spaces</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.letters.toLocaleString()}
                </span>
                <span className={s.statLabel}>Letters</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.digits.toLocaleString()}
                </span>
                <span className={s.statLabel}>Digits</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.whitespace.toLocaleString()}
                </span>
                <span className={s.statLabel}>Whitespace</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageShell>
  );
};

export default CharacterCounter;
