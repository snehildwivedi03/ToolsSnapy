/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import { wordCountApi, getApiError } from "../../../services/textApi";
import type { WordCountData } from "../../../services/textApi";
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
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

function formatReadingTime(seconds: number): string {
  if (seconds < 60) return "< 1 min read";
  const mins = Math.ceil(seconds / 60);
  return `${mins} min read`;
}

const WordCounter = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<WordCountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCount = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await wordCountApi(text);
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
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs with reading time."
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
              disabled={loading || !text.trim()}
            >
              {loading ? "Counting..." : "Count words"}
            </button>
            <button
              className={s.btnSecondary}
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
          {error !== null && (
            <p className={s.error}>{error}</p>
          )}
        </div>

        {/* Results */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Results</span>

          {result === null ? (
            <div className={s.placeholder}>
              <span>Results appear here</span>
              <span>Enter text and click Count words</span>
            </div>
          ) : (
            <div className={s.stats}>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.words.toLocaleString()}
                </span>
                <span className={s.statLabel}>Words</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.characters.toLocaleString()}
                </span>
                <span className={s.statLabel}>Characters</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.sentences.toLocaleString()}
                </span>
                <span className={s.statLabel}>Sentences</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statValue}>
                  {result.paragraphs.toLocaleString()}
                </span>
                <span className={s.statLabel}>Paragraphs</span>
              </div>
              <div className={s.readingTime}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatReadingTime(result.readingTime)}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageShell>
  );
};

export default WordCounter;
