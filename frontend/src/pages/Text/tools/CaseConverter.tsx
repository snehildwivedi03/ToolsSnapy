import { useState } from "react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import {
  caseConverterApi,
  getApiError,
} from "../../../services/textApi";
import type { CaseType } from "../../../services/textApi";
import s from "../../../styles/toolpage.module.css";

const CaseIcon = () => (
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
    <path d="M3 7l4 10M3 7l4-4 4 4M7 17h8" />
    <path d="M14 10l3 7M14 10h6M17 17h3" />
  </svg>
);

interface CaseOption {
  value: CaseType;
  label: string;
  preview: string;
}

const CASE_OPTIONS: CaseOption[] = [
  { value: "uppercase", label: "UPPER", preview: "HELLO WORLD" },
  { value: "lowercase", label: "lower", preview: "hello world" },
  { value: "titlecase", label: "Title", preview: "Hello World" },
  {
    value: "sentencecase",
    label: "Sentence",
    preview: "Hello world",
  },
  { value: "camelcase", label: "camel", preview: "helloWorld" },
  { value: "pascalcase", label: "Pascal", preview: "HelloWorld" },
  { value: "snakecase", label: "snake", preview: "hello_world" },
  { value: "kebabcase", label: "kebab", preview: "hello-world" },
];

const CaseConverter = () => {
  const [text, setText] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("uppercase");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await caseConverterApi(text, caseType);
      setOutput(res.data.data.result);
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

  return (
    <ToolPageShell
      backTo="/text"
      backLabel="Text Tools"
      icon={<CaseIcon />}
      iconColor="#2563eb"
      iconBg="#eff6ff"
      title="Case Converter"
      description="Convert text to uppercase, lowercase, camelCase, PascalCase, and more."
    >
      <div className={s.workspace}>
        {/* Input + options */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Input text</span>
          <textarea
            className={s.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            aria-label="Input text"
          />

          <span className={s.panelLabel}>Select case</span>
          <div className={s.caseGrid}>
            {CASE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={
                  caseType === opt.value
                    ? `${s.caseBtn} ${s.caseBtnActive}`
                    : s.caseBtn
                }
                onClick={() => setCaseType(opt.value)}
                title={opt.preview}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className={s.actions}>
            <button
              className={s.btnPrimary}
              onClick={handleConvert}
              disabled={loading || !text.trim()}
            >
              {loading ? "Converting..." : "Convert"}
            </button>
            <button className={s.btnSecondary} onClick={handleClear}>
              Clear
            </button>
          </div>
          {error !== null && <p className={s.error}>{error}</p>}
        </div>

        {/* Output */}
        <div className={s.panel}>
          <span className={s.panelLabel}>Result</span>

          {output === null ? (
            <div className={s.placeholder}>
              <span>Result appears here</span>
              <span>Select a case and click Convert</span>
            </div>
          ) : (
            <>
              <textarea
                className={s.textarea}
                value={output}
                readOnly
                aria-label="Converted text"
              />
              <div className={s.actions}>
                <button
                  className={
                    copied
                      ? `${s.btnSecondary} ${s.btnCopied}`
                      : s.btnSecondary
                  }
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy result"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ToolPageShell>
  );
};

export default CaseConverter;
