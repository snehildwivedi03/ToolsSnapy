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

const renderMarkdown = (source: string): string => {
  const rawHtml = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml);
};

const MarkdownViewer = () => {
  const [source, setSource] = useState(EXAMPLE);
  const [mode, setMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState<"html" | "md" | null>(null);
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

          <button type="button" className={md.tbBtn} onClick={() => setSource(EXAMPLE)}>Example</button>
          <button type="button" className={md.tbBtn} onClick={() => fileRef.current?.click()}>Import .md</button>
          <button type="button" className={md.tbBtn} onClick={download} disabled={!source}>Download</button>
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
