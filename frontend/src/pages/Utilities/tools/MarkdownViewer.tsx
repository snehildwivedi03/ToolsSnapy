import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import md from "./MarkdownViewer.module.css";

/* Render links safely: open in a new tab, no referrer/opener leakage */
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
});

marked.setOptions({ gfm: true, breaks: true });

const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // 2 MB import cap

type ViewMode = "edit" | "split" | "preview";

const EXAMPLE = `# Markdown Viewer

Welcome! Type on the **left**, see the rendered result on the **right**.

## Text formatting

You can write **bold**, *italic*, ~~strikethrough~~ and \`inline code\`.

> Blockquotes are great for callouts and quotes.

## Lists

- Fruits
  - Apple
  - Banana
- Vegetables

1. First
2. Second
3. Third

### Task list
- [x] Build the tool
- [x] Sanitize the HTML
- [ ] Ship it 🚀

## Table

| Tool        | Category   | Runs in browser |
| ----------- | ---------- | :-------------: |
| Zip / Unzip | Developer  | ✅ |
| Markdown    | Developer  | ✅ |

## Code block

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("world"));
\`\`\`

## Link

Learn more about [Markdown](https://commonmark.org).

---

*Everything is rendered locally — nothing is uploaded.*
`;

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M6 15V9l3 3 3-3v6" />
    <path d="M17 9v4" />
    <path d="M15 13l2 2 2-2" />
  </svg>
);

/* ── PDF capture styles (scoped to an off-screen container) ── */
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

const renderMarkdown = (source: string): string => {
  const rawHtml = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml);
};

const MarkdownViewer = () => {
  const [source,      setSource]     = useState(EXAMPLE);
  const [mode,        setMode]        = useState<ViewMode>("split");
  const [copied,      setCopied]      = useState<"html" | "md" | null>(null);
  const [pdfExporting,setPdfExporting]= useState(false);
  const [pdfDone,     setPdfDone]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const html = useMemo(() => renderMarkdown(source), [source]);

  const words = source.trim() ? source.trim().split(/\s+/).length : 0;
  const chars = source.length;
  const readMin = Math.max(1, Math.ceil(words / 200));

  const copy = async (kind: "html" | "md") => {
    await navigator.clipboard.writeText(kind === "html" ? html : source);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  const download = () => {
    const blob = new Blob([source], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      alert(`File is too large. The import limit is ${MAX_IMPORT_BYTES / (1024 * 1024)} MB.`);
      return;
    }
    const text = await file.text();
    setSource(text);
  };

  const exportPdf = async () => {
    if (!source.trim()) return;
    setPdfExporting(true);

    const rawHtml  = marked.parse(source, { async: false }) as string;
    const safeHtml = DOMPurify.sanitize(rawHtml);
    const titleMatch = source.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : "document";

    // Build a styled off-screen container for html2canvas to capture
    const uid       = `mdv${Date.now()}`;
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

      const pdf     = new jsPDF({ format: "a4", unit: "mm", orientation: "p" });
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

      const fname = title.replace(/[^\w\s-]/g, "").trim() || "document";
      pdf.save(`${fname}.pdf`);

      setPdfDone(true);
      setTimeout(() => setPdfDone(false), 2000);
    } catch {
      /* silent — leave UI ready to retry */
    } finally {
      document.head.removeChild(styleEl);
      document.body.removeChild(container);
      setPdfExporting(false);
    }
  };

  const showEditor = mode !== "preview";
  const showPreview = mode !== "edit";

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Developer Tools"
      icon={<Icon />}
      iconColor="#6f4e37"
      iconBg="#faf6f1"
      title="Markdown Viewer"
      description="Write or paste Markdown and see a clean, live preview. Supports GitHub-flavored tables, task lists and code blocks. Rendered locally and sanitized — nothing is uploaded."
    >
      <div className={s.card}>
        <div className={md.toolbar}>
          <div className={s.chipGroup}>
            <button type="button" className={`${s.chip} ${mode === "edit" ? s.chipActive : ""}`}
              onClick={() => setMode("edit")}>Edit</button>
            <button type="button" className={`${s.chip} ${mode === "split" ? s.chipActive : ""}`}
              onClick={() => setMode("split")}>Split</button>
            <button type="button" className={`${s.chip} ${mode === "preview" ? s.chipActive : ""}`}
              onClick={() => setMode("preview")}>Preview</button>
          </div>

          <span className={md.spacer} />

          <button type="button"
            className={`${md.tbBtn} ${source === EXAMPLE ? md.tbActive : ""}`}
            onClick={() => setSource(EXAMPLE)}>Example</button>
          <button type="button" className={md.tbBtn} onClick={() => fileRef.current?.click()}>Import .md</button>
          <button type="button" className={md.tbBtn} onClick={download} disabled={!source}>Download .md</button>
          <button type="button"
            className={`${md.tbBtn} ${md.tbPdf} ${pdfDone ? md.tbBtnDone : ""}`}
            onClick={exportPdf}
            disabled={pdfExporting || !source}>
            {pdfExporting ? "Preparing…" : pdfDone ? "Downloaded!" : "Download PDF"}
          </button>
          <button type="button" className={`${md.tbBtn} ${md.tbCopy} ${copied === "md" ? md.tbBtnDone : ""}`}
            onClick={() => copy("md")} disabled={!source}>
            {copied === "md" ? "Copied!" : "Copy MD"}
          </button>
          <button type="button" className={`${md.tbBtn} ${md.tbCopy} ${copied === "html" ? md.tbBtnDone : ""}`}
            onClick={() => copy("html")} disabled={!source}>
            {copied === "html" ? "Copied!" : "Copy HTML"}
          </button>
          <input ref={fileRef} type="file" accept=".md,.markdown,.txt,text/markdown"
            style={{ display: "none" }}
            onChange={(e) => { importFile(e.target.files); e.target.value = ""; }} />
        </div>

        <div className={`${md.split} ${mode === "split" ? md.splitBoth : ""}`}>
          {showEditor && (
            <div className={md.pane}>
              <span className={md.paneLabel}>Markdown</span>
              <textarea
                className={md.editor}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Type or paste your Markdown here…"
                spellCheck={false}
              />
            </div>
          )}

          {showPreview && (
            <div className={md.pane}>
              <span className={md.paneLabel}>Preview</span>
              {source.trim() ? (
                <div className={md.preview} dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <div className={md.preview}>
                  <p className={md.placeholder}>Nothing to preview yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={md.stats}>
          <span>{readMin} min read</span>
          <span>{words} words</span>
          <span>{chars} chars</span>
        </div>
      </div>
    </ToolPageShell>
  );
};

export default MarkdownViewer;
