import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./DevTool.module.css";
import st from "./UrlShortener.module.css";

// Relative base ("") so the request goes through the Vite proxy (/api → backend)
// and works across devices (e.g. phone over port forwarding). An absolute
// "localhost" URL would resolve to the visiting device itself.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

interface ShortResult {
  code:        string;
  shortUrl:    string;
  originalUrl: string;
  expiresAt:   number;
  clicks:      number;
}

interface HistoryEntry {
  shortUrl:    string;
  originalUrl: string;
  expiresAt:   number;
}

const LS_KEY = "url_shortener_history";
const MAX_HISTORY = 5;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryEntry[];
    const now = Date.now();
    return arr.filter((e) => e.expiresAt > now);
  } catch { return []; }
}

function saveHistory(entry: HistoryEntry): void {
  try {
    const prev = loadHistory();
    const deduped = prev.filter((e) => e.shortUrl !== entry.shortUrl);
    const next = [entry, ...deduped].slice(0, MAX_HISTORY);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

function timeLeft(expiresAt: number): string {
  const diff = Math.max(0, expiresAt - Date.now());
  const h    = Math.floor(diff / 3_600_000);
  const m    = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const UrlShortener = () => {
  const [url,       setUrl]       = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [result,    setResult]    = useState<ShortResult | null>(null);
  const [copied,    setCopied]    = useState(false);
  const [history,   setHistory]   = useState<HistoryEntry[]>(loadHistory);
  const [tick,      setTick]      = useState(0);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef  = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);

  // Tick every 30s to refresh the expiry countdown
  useEffect(() => {
    timerRef.current = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);
  // keep tick in dep array to suppress lint warning
  void tick;

  const shorten = async () => {
    setError("");
    const trimmed = url.trim();
    if (!trimmed) { setError("Please enter a URL."); return; }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("URL must start with http:// or https://");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/shorten`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: trimmed }),
      });
      const data = await res.json() as { success: boolean; message?: string } & Partial<ShortResult>;
      if (data.success && data.shortUrl) {
        const r: ShortResult = {
          code:        data.code!,
          shortUrl:    data.shortUrl,
          originalUrl: data.originalUrl!,
          expiresAt:   data.expiresAt!,
          clicks:      data.clicks ?? 0,
        };
        setResult(r);
        saveHistory({ shortUrl: r.shortUrl, originalUrl: r.originalUrl, expiresAt: r.expiresAt });
        setHistory(loadHistory());
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      } else {
        setError(data.message ?? "Could not shorten the URL. Please try again.");
      }
    } catch {
      setError("Could not connect to the server. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadQR = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a  = document.createElement("a");
    a.href   = canvas.toDataURL("image/png");
    a.download = `qr-${result?.code ?? "link"}.png`;
    a.click();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") shorten();
  };

  return (
    <ToolPageShell
      title="URL Shortener"
      description="Turn long URLs into short, shareable links. Links expire after 24 hours."
      icon={<Icon />}
      iconColor="#6f4e37"
      iconBg="#faf6f1"
      backTo="/utilities"
      backLabel="Developer Tools"
    >
      {/* ── Input ─────────────────────────────────────────────── */}
      <div className={s.card}>
        <p className={s.cardTitle}>Shorten a URL</p>

        <div className={st.inputRow}>
          <input
            className={`${s.input} ${st.urlInput}`}
            type="url"
            placeholder="https://your-very-long-url.com/goes/here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKey}
            aria-label="URL to shorten"
            maxLength={2048}
          />
          <button
            className={`${s.calcBtn} ${st.shortenBtn}`}
            onClick={shorten}
            disabled={loading}
          >
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>

        {error && <p className={ls.error}>{error}</p>}
      </div>

      {/* ── Result ────────────────────────────────────────────── */}
      {result && (
        <div className={s.card} ref={resultRef}>
          <p className={s.cardTitle}>Your Short Link</p>

          <div className={st.resultGrid}>
            {/* Left: URL info */}
            <div className={st.resultInfo}>
              <div className={st.shortUrlRow}>
                <a
                  className={st.shortUrlLink}
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {result.shortUrl}
                </a>
                <button
                  className={`${ls.copyBtn} ${copied ? ls.copyDone : ""}`}
                  onClick={copy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className={st.metaRow}>
                <span className={st.metaItem}>
                  <span className={st.metaLabel}>Original URL</span>
                  <span className={st.metaValue} title={result.originalUrl}>
                    {result.originalUrl.length > 60
                      ? result.originalUrl.slice(0, 57) + "…"
                      : result.originalUrl}
                  </span>
                </span>
                <span className={st.metaItem}>
                  <span className={st.metaLabel}>Expires in</span>
                  <span className={st.metaValue}>{timeLeft(result.expiresAt)}</span>
                </span>
                <span className={st.metaItem}>
                  <span className={st.metaLabel}>Clicks</span>
                  <span className={st.metaValue}>{result.clicks}</span>
                </span>
              </div>
            </div>

            {/* Right: QR code */}
            <div className={st.qrWrap} ref={canvasRef}>
              <QRCodeCanvas
                value={result.shortUrl}
                size={140}
                fgColor="#3b2314"
                bgColor="#faf6f1"
              />
              <button className={`${ls.copyBtn} ${st.dlQrBtn}`} onClick={downloadQR}>
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History ───────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className={s.card}>
          <p className={s.cardTitle}>Recent Links</p>
          <ul className={st.historyList}>
            {history.map((h) => (
              <li key={h.shortUrl} className={st.historyItem}>
                <a
                  className={st.historyShort}
                  href={h.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {h.shortUrl}
                </a>
                <span className={st.historyOriginal} title={h.originalUrl}>
                  {h.originalUrl.length > 55
                    ? h.originalUrl.slice(0, 52) + "…"
                    : h.originalUrl}
                </span>
                <span className={st.historyExpiry}>expires {timeLeft(h.expiresAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ToolPageShell>
  );
};

export default UrlShortener;
