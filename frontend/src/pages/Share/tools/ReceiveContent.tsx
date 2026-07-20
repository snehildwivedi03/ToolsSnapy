import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import Toast from "../../../components/Toast/Toast";
import s from "../../../styles/calc.module.css";
import t from "./ShareTool.module.css";
import tp from "../../../styles/toolpage.module.css";
import { receiveShare, downloadZipUrl, downloadFileUrl, previewFileUrl, deleteShare } from "../../../services/shareApi";

type ShareInfo = {
  code: string;
  type: "text" | "files";
  expiresAt: number;
  content?: string;
  files?: { name: string; path: string; size: number }[];
  totalSize?: number;
  fileCount?: number;
  hasZip?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function isImage(name: string): boolean {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name);
}

function formatCountdown(expiresAt: number): string {
  const diff = Math.max(0, expiresAt - Date.now());
  const m = Math.floor(diff / 60_000);
  const sec = Math.floor((diff % 60_000) / 1000);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const ReceiveContent = () => {
  const [code,     setCode]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [share,    setShare]    = useState<ShareInfo | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted,  setDeleted]  = useState(false);
  const [download, setDownload] = useState<string | null>(null);
  const [,         setTick]     = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const location  = useLocation();

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const lookup = async (codeArg?: string) => {
    const source = typeof codeArg === "string" ? codeArg : code;
    const clean = source.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length !== 6) { setError("Enter a valid 6-character share code."); return; }

    // Clear any previous result and stop its countdown before a new lookup,
    // so a failed/expired lookup never leaves stale content or a running timer.
    setError("");
    setShare(null);
    setDeleted(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setLoading(true);
    try {
      const res = await receiveShare(clean);
      if (res.success && res.share) {
        setShare(res.share as ShareInfo);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setTick((n) => n + 1), 1000);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      } else {
        setError(res.message ?? "We couldn't find that code. It may be wrong, or the share may have expired.");
      }
    } catch {
      setError("We couldn't connect. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load content when a code is passed in via navigation state (e.g. after sharing from a tool).
  useEffect(() => {
    const incoming = (location.state as { code?: string } | null)?.code;
    if (incoming) {
      const clean = incoming.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setCode(clean);
      lookup(clean);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyText = async () => {
    if (!share?.content) return;
    try { await navigator.clipboard.writeText(share.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch {/* ignore */}
  };

  const reset = () => {
    setShare(null);
    setCode("");
    setError("");
    setDeleted(false);
    setDeleting(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleDelete = async () => {
    if (!share) return;
    setDeleting(true);
    try {
      await deleteShare(share.code);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setShare(null);
      setDeleted(true);
      setDownload("Share deleted successfully.");
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  };

  const expired = share && Date.now() > share.expiresAt;

  return (
    <ToolPageShell
      backTo="/share"
      backLabel="Instant Share"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
      }
      iconColor="#d97706"
      iconBg="#fffbeb"
      title="Receive Content"
      description="Enter the 6-character share code to retrieve text, files, images or PDFs."
    >
      {download && (
        <Toast message={download} onClose={() => setDownload(null)} />
      )}
      {/* Code input */}
      <div className={`${s.card} ${t.codeCard}`}>
        <div className={`${s.fieldGroup} ${t.codeField}`}>
          <label className={s.label} htmlFor="receive-code-input">Share Code</label>
          <input
            id="receive-code-input"
            className={`${s.input} ${t.codeInput}`}
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="e.g. A7K9PX"
            autoComplete="off"
            spellCheck={false}
            style={{ letterSpacing: "0.2em", fontFamily: "Courier New, monospace", textTransform: "uppercase" }}
          />
        </div>
        {error && <div className={t.errorList}><span className={t.errorItem}>{error}</span></div>}
        <button
          className={`${s.primaryBtn} ${t.retrieveBtn}`}
          onClick={() => lookup()}
          disabled={loading || code.length < 6}
        >
          {loading ? "Looking up…" : "Retrieve Content"}
        </button>
      </div>

      {/* Result */}
      {share && !deleted && (
        <div ref={resultRef}>
          {expired ? (
            <div className={t.errorList}>
              <span className={t.errorItem}>This share has expired.</span>
            </div>
          ) : (
            <div className={s.card}>
              {/* Header row */}
              <div className={s.rowBetween}>
                <div className={s.resultLabel}>
                  {share.type === "text" ? "Shared Text" : `${share.fileCount ?? 0} File${(share.fileCount ?? 0) !== 1 ? "s" : ""}`}
                  {share.type === "files" && share.totalSize != null && (
                    <span style={{ color: "var(--color-text-muted)", fontWeight: 500, marginLeft: "0.5rem" }}>
                      ({formatBytes(share.totalSize)})
                    </span>
                  )}
                </div>
                <span className={t.countdown}>
                  {formatCountdown(share.expiresAt)}
                </span>
              </div>

              {/* Text content */}
              {share.type === "text" && share.content != null && (
                <>
                  <textarea
                    className={s.textarea}
                    rows={10}
                    readOnly
                    value={share.content}
                    style={{ resize: "vertical" }}
                  />
                  <div className={tp.actionsStack}>
                    <button
                      style={{ minWidth: "7.5rem" }}
                      className={copied ? `${tp.btnSecondary} ${tp.btnCopied}` : tp.btnSecondary}
                      onClick={copyText}
                    >
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                </>
              )}

              {/* File list + download */}
              {share.type === "files" && (
                <>
                  {/* Single-image preview (shared as-is, no ZIP) */}
                  {share.files && share.files.length === 1 && isImage(share.files[0]!.name) && (
                    <a
                      href={previewFileUrl(share.code, share.files[0]!.path)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "block", marginBottom: "1rem" }}
                    >
                      <img
                        src={previewFileUrl(share.code, share.files[0]!.path)}
                        alt={share.files[0]!.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "320px",
                          borderRadius: "var(--radius-lg)",
                          border: "1.5px solid var(--color-border)",
                          objectFit: "contain",
                          display: "block",
                          margin: "0 auto",
                        }}
                      />
                    </a>
                  )}

                  {share.hasZip && (
                    <a
                      href={downloadZipUrl(share.code)}
                      download={`share-${share.code}.zip`}
                      className={s.primaryBtn}
                      onClick={() => setDownload("Download started. Your ZIP is on the way.")}
                      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download All as ZIP
                    </a>
                  )}

                  {share.files && share.files.length > 0 && (
                    <div className={t.fileList}>
                      {share.files.map((f, i) => (
                        <div key={i} className={t.fileItem}>
                          <span className={t.fileName}>{f.name}</span>
                          <span className={t.fileSize}>{formatBytes(f.size)}</span>
                          <a
                            href={downloadFileUrl(share.code, f.path)}
                            download={f.name}
                            className={t.fileRemove}
                            onClick={() => setDownload(`Downloading ${f.name}…`)}
                            style={{ color: "var(--color-accent)" }}
                            aria-label={`Download ${f.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              aria-hidden="true">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {share && !deleted && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className={tp.btnSecondary} onClick={reset}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Enter a different code
          </button>
          {!expired && (
            <button className={tp.btnDanger} onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete Now"}
            </button>
          )}
        </div>
      )}

      {deleted && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className={tp.btnSecondary} onClick={reset}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Enter another code
          </button>
        </div>
      )}
    </ToolPageShell>
  );
};

export default ReceiveContent;
