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

/* ── Scoped CSS injected into the off-screen capture container ── */
function buildContainerCss(uid: string): string {
  return `
    #${uid} {
      font-family: Georgia,"Times New Roman",serif;
      font-size: 16px; line-height: 1.75; color: #1a1a1a; background: #fff;
    }
    #${uid} h1,#${uid} h2,#${uid} h3,#${uid} h4,#${uid} h5,#${uid} h6 {
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      line-height: 1.3; color: #111; margin: 1.25em 0 0.4em;
    }
    #${uid} h1 { font-size: 2em;   border-bottom: 2px solid #e5e7eb; padding-bottom: 0.2em; margin-top: 0; }
    #${uid} h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.15em; }
    #${uid} h3 { font-size: 1.25em; } #${uid} h4 { font-size: 1em; }
    #${uid} p  { margin: 0 0 0.85em; }
    #${uid} a  { color: #1d4ed8; }
    #${uid} strong { font-weight: 700; } #${uid} em { font-style: italic; }
    #${uid} del { text-decoration: line-through; color: #6b7280; }
    #${uid} code {
      font-family: "Courier New",monospace; background: #f3f4f6;
      padding: 0.1em 0.35em; border-radius: 3px; color: #b91c1c;
    }
    #${uid} pre {
      background: #1e1e2e; color: #cdd6f4; padding: 0.9em 1.1em;
      border-radius: 6px; overflow: hidden; margin: 0.85em 0;
    }
    #${uid} pre code { background: none; color: inherit; padding: 0; }
    #${uid} blockquote {
      margin: 0.85em 0; padding: 0.6em 1em;
      border-left: 4px solid #6f4e37; background: #faf6f1; color: #555;
    }
    #${uid} blockquote p:last-child { margin-bottom: 0; }
    #${uid} ul,#${uid} ol { padding-left: 1.75em; margin: 0.4em 0 0.85em; }
    #${uid} li { margin-bottom: 0.2em; }
    #${uid} table { width:100%; border-collapse:collapse; margin:0.85em 0; }
    #${uid} th,#${uid} td { border:1px solid #d1d5db; padding:0.45em 0.75em; text-align:left; }
    #${uid} th { background:#f9fafb; font-weight:700; }
    #${uid} tr:nth-child(even) td { background:#f9fafb; }
    #${uid} hr { border:none; border-top:1px solid #e5e7eb; margin:1.25em 0; }
    #${uid} img { max-width:100%; height:auto; }
    #${uid} input[type="checkbox"] { margin-right:0.4em; }
  `;
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

  /* ── PDF export (direct download, no print dialog) ───────── */
  const handleExport = async () => {
    if (!markdown.trim()) {
      setError("Please add some Markdown content first.");
      return;
    }
    setError("");
    setExporting(true);

    const rawHtml  = String(marked.parse(markdown));
    const safeHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });

    // Build a styled off-screen container for html2canvas to capture
    const uid       = `mdpdf${Date.now()}`;
    const styleEl   = document.createElement("style");
    styleEl.textContent = buildContainerCss(uid);
    const container = document.createElement("div");
    container.id    = uid;
    container.style.cssText =
      "position:absolute;left:-9999px;top:0;width:794px;padding:56px 80px;box-sizing:border-box;background:#fff;";
    container.innerHTML = safeHtml;
    document.head.appendChild(styleEl);
    document.body.appendChild(container);

    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
      });

      const pdf     = new jsPDF({ format: pageSize, unit: "mm", orientation: "p" });
      const pageW   = pdf.internal.pageSize.getWidth();
      const pageH   = pdf.internal.pageSize.getHeight();
      const margin  = 12;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;

      const mmPerPx  = usableW / 794;
      const totalHmm = (canvas.height / 2) * mmPerPx;

      let yMm  = 0;
      let page = 0;

      while (yMm < totalHmm) {
        if (page > 0) pdf.addPage();

        const sliceHmm = Math.min(usableH, totalHmm - yMm);
        const srcY     = Math.round((yMm / mmPerPx) * 2);
        const srcH     = Math.round((sliceHmm / mmPerPx) * 2);
        const clampedH = Math.min(srcH, canvas.height - srcY);
        if (clampedH <= 0) break;

        const crop  = document.createElement("canvas");
        crop.width  = canvas.width;
        crop.height = clampedH;
        crop.getContext("2d")!.drawImage(
          canvas, 0, srcY, canvas.width, clampedH,
          0,      0, crop.width, crop.height,
        );

        const actualHmm = (clampedH / 2) * mmPerPx;
        pdf.addImage(crop.toDataURL("image/jpeg", 0.93), "JPEG",
          margin, margin, usableW, actualHmm);

        yMm  += actualHmm;
        page += 1;
      }

      const fname = (title.trim() || "document")
        .replace(/[^\w\s-]/g, "").trim() || "document";
      pdf.save(`${fname}.pdf`);

      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      document.head.removeChild(styleEl);
      document.body.removeChild(container);
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
            className={`${st.tbBtn} ${st.exportBtn} ${exported ? st.exportDone : ""}`}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Generating PDF…" : exported ? "Downloaded!" : "Download PDF"}
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
              className={`${st.tbBtn} ${markdown === EXAMPLE_MD ? st.tbActive : ""}`}
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
