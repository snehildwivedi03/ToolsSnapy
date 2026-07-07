import { useState, useRef, useCallback } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./pdfTools.module.css";
import st from "./MarkdownToPdf.module.css";

/* ── Types ─────────────────────────────────────────────────── */
type Mode     = "edit" | "split" | "preview";
type PageSize = "a4" | "letter";

/* ── Example document ──────────────────────────────────────── */
const EXAMPLE_MD = `# Project Report

## Summary

Generated with **ToolsSnapy** Markdown → PDF converter. Everything runs in your browser — nothing is uploaded.

---

## Features

- Clean, print-optimised typography
- Supports **bold**, _italic_, \`inline code\`, and ~~strikethrough~~
- Tables, task lists, code blocks, and blockquotes
- A4 and Letter page sizes

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

## Data Table

| Feature       | Support |
|---------------|---------|
| Headings      | ✅      |
| Code blocks   | ✅      |
| Tables        | ✅      |
| Task lists    | ✅      |
| Blockquotes   | ✅      |

## Task List

- [x] Write your Markdown
- [x] Preview the output
- [ ] Click **Export PDF** to download

> **Tip:** Switch between *Edit*, *Split*, and *Preview* modes using the buttons above.
`;

/* ── Helpers ────────────────────────────────────────────────── */
function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPrintDocument(bodyHtml: string, title: string, pageSize: PageSize): string {
  const pSize = pageSize === "a4" ? "A4" : "letter";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${escHtml(title)}</title>
<style>
@page { size: ${pSize}; margin: 20mm; }
*,*::before,*::after { box-sizing: border-box; }
body {
  font-family: Georgia,"Times New Roman",serif;
  font-size: 12pt; line-height: 1.75; color: #1a1a1a; margin: 0; padding: 0;
}
h1,h2,h3,h4,h5,h6 {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  line-height: 1.3; margin: 1.4em 0 0.4em; page-break-after: avoid; color: #111;
}
h1 { font-size: 24pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.2em; margin-top: 0; }
h2 { font-size: 18pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.15em; }
h3 { font-size: 14pt; } h4 { font-size: 12pt; }
h5 { font-size: 11pt; } h6 { font-size: 10pt; color: #555; }
p { margin: 0 0 0.85em; orphans: 3; widows: 3; }
a { color: #1d4ed8; }
a[href]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: #6b7280; }
strong { font-weight: 700; } em { font-style: italic; }
del { text-decoration: line-through; color: #6b7280; }
code {
  font-family: "Courier New",monospace; font-size: 10pt;
  background: #f3f4f6; padding: 0.1em 0.35em; border-radius: 3px; color: #b91c1c;
}
pre {
  background: #1e1e2e; color: #cdd6f4; padding: 0.9em 1.1em;
  border-radius: 6px; overflow: hidden; page-break-inside: avoid; margin: 0.85em 0;
}
pre code { background: none; color: inherit; padding: 0; font-size: 10pt; }
blockquote {
  margin: 0.85em 0; padding: 0.6em 1em;
  border-left: 4px solid #6f4e37; background: #faf6f1;
  color: #555; page-break-inside: avoid;
}
blockquote p:last-child { margin-bottom: 0; }
ul,ol { padding-left: 1.75em; margin: 0.4em 0 0.85em; }
li { margin-bottom: 0.2em; }
table { width: 100%; border-collapse: collapse; margin: 0.85em 0; page-break-inside: avoid; font-size: 11pt; }
th,td { border: 1px solid #d1d5db; padding: 0.45em 0.75em; text-align: left; }
th { background: #f9fafb; font-weight: 700; }
tr:nth-child(even) td { background: #f9fafb; }
hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.25em 0; }
img { max-width: 100%; height: auto; page-break-inside: avoid; }
input[type="checkbox"] { margin-right: 0.4em; }
@media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

/* ── Icon ───────────────────────────────────────────────────── */
const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

/* ── Component ──────────────────────────────────────────────── */
const MarkdownToPdf = () => {
  const [markdown,  setMarkdown]  = useState(EXAMPLE_MD);
  const [title,     setTitle]     = useState("Project Report");
  const [mode,      setMode]      = useState<Mode>("split");
  const [pageSize,  setPageSize]  = useState<PageSize>("a4");
  const [exporting, setExporting] = useState(false);
  const [exported,  setExported]  = useState(false);
  const [error,     setError]     = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderHtml = useCallback((): string => {
    if (!markdown.trim()) {
      return "<p style='color:#9ca3af;font-style:italic'>Nothing to preview yet.</p>";
    }
    const raw = String(marked.parse(markdown));
    return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  }, [markdown]);

  /* ── File upload ─────────────────────────────────────────── */
  const handleFile = (file: File) => {
    if (!file.name.match(/\.(md|txt|markdown)$/i)) {
      setError("Only .md, .txt, or .markdown files are supported.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large (max 2 MB).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? "";
      setMarkdown(text);
      const base = file.name.replace(/\.(md|txt|markdown)$/i, "");
      if (!title.trim() || title === "My Document") setTitle(base);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  /* ── PDF export ──────────────────────────────────────────── */
  const handleExport = () => {
    if (!markdown.trim()) {
      setError("Please add some Markdown content first.");
      return;
    }
    setError("");
    setExporting(true);

    const rawHtml  = String(marked.parse(markdown));
    const safeHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
    const printDoc = buildPrintDocument(safeHtml, title.trim() || "Document", pageSize);

    try {
      const blob   = new Blob([printDoc], { type: "text/html;charset=utf-8" });
      const url    = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;width:0;height:0;border:none;top:0;left:0;opacity:0;pointer-events:none;";
      iframe.src = url;

      iframe.addEventListener("load", () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          // Fallback: open in a new tab so the user can Ctrl+P
          window.open(url, "_blank");
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          setExporting(false);
          setExported(true);
          setTimeout(() => setExported(false), 2500);
        }, 1500);
      }, { once: true });

      document.body.appendChild(iframe);
    } catch {
      setError("Export failed. Please try again.");
      setExporting(false);
    }
  };

  /* ── JSX ─────────────────────────────────────────────────── */
  return (
    <ToolPageShell
      title="Markdown to PDF"
      description="Write or upload Markdown and export it as a clean, well-formatted PDF. Everything runs in your browser."
      icon={<Icon />}
      iconColor="#dc2626"
      iconBg="#fef2f2"
      backTo="/pdf"
      backLabel="PDF Tools"
    >
      {/* ── Settings ────────────────────────────────────────── */}
      <div className={s.card}>
        <div className={st.settingsRow}>
          <div className={st.settingGroup}>
            <label className={st.settingLabel} htmlFor="pdf-doc-title">
              Document title
            </label>
            <input
              id="pdf-doc-title"
              className={`${s.input} ${st.titleInput}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Document"
              maxLength={120}
            />
          </div>

          <div className={st.settingGroup}>
            <span className={st.settingLabel}>Page size</span>
            <div className={s.chipGroup}>
              {(["a4", "letter"] as PageSize[]).map((sz) => (
                <button
                  key={sz}
                  className={`${s.chip} ${pageSize === sz ? s.chipActive : ""}`}
                  onClick={() => setPageSize(sz)}
                >
                  {sz === "a4" ? "A4" : "Letter"}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`${s.calcBtn} ${st.exportBtn} ${exported ? st.exportDone : ""}`}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Preparing…" : exported ? "Print dialog opened!" : "Export PDF"}
          </button>
        </div>

        {error && <p className={st.errorMsg}>{error}</p>}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className={s.card}>
        <div className={st.toolbar}>
          <div className={s.chipGroup}>
            {(["edit", "split", "preview"] as Mode[]).map((m) => (
              <button
                key={m}
                className={`${s.chip} ${mode === m ? s.chipActive : ""}`}
                onClick={() => setMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className={st.toolbarActions}>
            <button
              className={st.tbBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Upload a .md or .txt file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload .md
            </button>
            <button
              className={st.tbBtn}
              onClick={() => { setMarkdown(EXAMPLE_MD); setTitle("Project Report"); setError(""); }}
              title="Load example document"
            >
              Example
            </button>
            <button
              className={st.tbBtn}
              onClick={() => { setMarkdown(""); setTitle("My Document"); setError(""); }}
              title="Clear the editor"
            >
              Clear
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.markdown"
          className={ls.hiddenInput}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0]);
              e.target.value = "";
            }
          }}
        />

        {/* ── Editor / Preview area ────────────────────────── */}
        <div
          className={`${st.editorArea} ${mode === "split" ? st.splitMode : ""}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {(mode === "edit" || mode === "split") && (
            <div className={st.pane}>
              <div className={st.paneLabel}>Markdown</div>
              <textarea
                className={st.textarea}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder={"# Hello World\n\nStart writing your Markdown here…"}
                spellCheck={false}
                aria-label="Markdown input"
              />
            </div>
          )}

          {(mode === "preview" || mode === "split") && (
            <div className={st.pane}>
              <div className={st.paneLabel}>Preview</div>
              <div
                className={st.preview}
                dangerouslySetInnerHTML={{ __html: renderHtml() }}
              />
            </div>
          )}
        </div>
      </div>

      <p className={st.hint}>
        Drag & drop a <strong>.md</strong> or <strong>.txt</strong> file onto the editor above, or click <strong>Upload .md</strong>.
      </p>
    </ToolPageShell>
  );
};

export default MarkdownToPdf;
