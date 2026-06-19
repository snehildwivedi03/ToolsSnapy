/**
 * memeView.ts
 *
 * Displays a timed cat-meme WebviewPanel when a paste-count milestone is
 * reached for the first time in a session. Each milestone has its own SVG
 * illustration and shame caption.
 */
import * as vscode from "vscode";

// ── Types ────────────────────────────────────────────────────────────────────

export interface MemeConfig {
  /** Paste count that triggers this milestone. */
  readonly milestone: number;
  /** PNG filename inside images/memes/ (e.g. "cat-mild.png"). */
  readonly imageName: string;
  /** One-liner caption shown beneath the meme image. */
  readonly caption: string;
  /** Heading / shame-level label shown on the panel. */
  readonly shameLevel: string;
  /** CSS hex color used for the banner, accents, and countdown bar. */
  readonly accentColor: string;
  /** Seconds before the webview panel auto-closes. */
  readonly displaySeconds: number;
}

// ── Milestone definitions ────────────────────────────────────────────────────

/** Ordered milestone definitions – evaluated against the current paste count. */
export const MEME_MILESTONES: readonly MemeConfig[] = [
  {
    milestone: 100,
    imageName: "segent100.png",
    caption: "You've earned your stripes, Sergeant. Now write your own code.",
    shameLevel: "SERGEANT",
    accentColor: "#cba6f7",
    displaySeconds: 8,
  },
  {
    milestone: 500,
    imageName: "captain500.png",
    caption: "Captain on deck — of Stack Overflow.",
    shameLevel: "CAPTAIN",
    accentColor: "#fab387",
    displaySeconds: 8,
  },
  {
    milestone: 1000,
    imageName: "cheif1000.png",
    caption: "The Chief commands all — and writes none.",
    shameLevel: "CHIEF",
    accentColor: "#f38ba8",
    displaySeconds: 10,
  },
  {
    milestone: 2000,
    imageName: "god2000.png",
    caption: "You have transcended. No code is truly yours anymore.",
    shameLevel: "GOD LEVEL",
    accentColor: "#f9e2af",
    displaySeconds: 12,
  },
];

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the highest MemeConfig whose milestone has just been crossed for
 * the first time, or `undefined` if no new milestone was reached.
 *
 * @param pasteCount  Current total paste count after the latest increment.
 * @param shownSet    Set of milestone numbers that have already been displayed.
 */
export function getTriggeredMilestone(
  pasteCount: number,
  shownSet: ReadonlySet<number>
): MemeConfig | undefined {
  // Iterate in reverse so the highest newly-reached milestone wins.
  for (let i = MEME_MILESTONES.length - 1; i >= 0; i--) {
    const cfg = MEME_MILESTONES[i];
    if (pasteCount >= cfg.milestone && !shownSet.has(cfg.milestone)) {
      return cfg;
    }
  }
  return undefined;
}

/**
 * Opens a timed WebviewPanel that displays the cat meme for the given
 * milestone. The panel auto-closes after 8 seconds.
 *
 * @param extensionUri VS Code ExtensionContext.extensionUri used to resolve
 *                     the local SVG image path.
 * @param config       Milestone configuration to render.
 */
export function showMemeMilestone(
  extensionUri: vscode.Uri,
  config: MemeConfig
): void {
  const panel = vscode.window.createWebviewPanel(
    "copyPasteRangerMeme",
    `Copy Paste Ranger — ${config.shameLevel}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: false,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, "images", "memes"),
      ],
    }
  );

  const imageWebviewUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "images", "memes", config.imageName)
  );

  panel.webview.html = buildHtml(
    panel.webview.cspSource,
    imageWebviewUri.toString(),
    config
  );

  // Auto-dispose after config.displaySeconds; guard against manual close.
  const timer = setTimeout(() => {
    try { panel.dispose(); } catch { /* already disposed */ }
  }, config.displaySeconds * 1000);

  panel.onDidDispose(() => clearTimeout(timer));
}

// ── Private helpers ──────────────────────────────────────────────────────────

function buildHtml(
  cspSource: string,
  imageUri: string,
  config: MemeConfig
): string {
  const isGodLevel = config.shameLevel === "GOD LEVEL";
  const secs = config.displaySeconds;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${cspSource}; style-src 'unsafe-inline';">
  <title>${config.shameLevel}</title>
  <style>
    :root {
      --accent:     ${config.accentColor};
      --accent-dim: ${config.accentColor}33;
      --accent-mid: ${config.accentColor}88;
      --duration:   ${secs}s;
    }
    @keyframes slideDown {
      from { transform: translateY(-30px); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
    @keyframes countdown {
      from { width: 100%; }
      to   { width: 0%;   }
    }
    @keyframes godPulse {
      0%, 100% { box-shadow: 0 0 22px var(--accent-dim); }
      50%      { box-shadow: 0 0 55px var(--accent-mid), 0 0 110px var(--accent-dim); }
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #13131e;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      width: 100%;
      max-width: 460px;
      background: #1e1e2e;
      border: 1.5px solid var(--accent-mid);
      border-radius: 18px;
      overflow: hidden;
      animation: slideDown 0.5s cubic-bezier(0.34,1.4,0.64,1) forwards${isGodLevel ? ", godPulse 2.8s ease-in-out 0.6s infinite" : ""};
    }
    .banner {
      background: var(--accent);
      padding: 0.85rem 1.5rem 0.9rem;
      text-align: center;
    }
    .banner-badge {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #1e1e2e;
      opacity: 0.6;
      margin-bottom: 0.2rem;
    }
    .banner-title {
      font-size: 1.55rem;
      font-weight: 800;
      color: #1e1e2e;
      letter-spacing: 0.06em;
    }
    .image-wrap { padding: 1.1rem 1.1rem 0; }
    .meme-img {
      width: 100%;
      border-radius: 10px;
      border: 1px solid #313244;
      display: block;
    }
    .body {
      padding: 0.9rem 1.5rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .caption {
      font-size: 0.95rem;
      color: var(--accent);
      font-style: italic;
      text-align: center;
      line-height: 1.55;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.67rem;
      color: #585b70;
    }
    .countdown-track { height: 4px; background: #313244; }
    .countdown-fill {
      height: 100%;
      background: var(--accent);
      animation: countdown var(--duration) linear forwards;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="banner">
      <div class="banner-badge">${config.milestone} Pastes Reached</div>
      <div class="banner-title">${config.shameLevel}</div>
    </div>
    <div class="image-wrap">
      <img class="meme-img" src="${imageUri}" alt="${config.shameLevel} cat meme" />
    </div>
    <div class="body">
      <p class="caption">&ldquo;${config.caption}&rdquo;</p>
      <div class="meta">
        <span>Copy Paste Ranger</span>
        <span>Closes in ${secs}s</span>
      </div>
    </div>
    <div class="countdown-track">
      <div class="countdown-fill"></div>
    </div>
  </div>
</body>
</html>`;
}
