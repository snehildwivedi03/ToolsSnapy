// One-off generator for the social share preview image (public/og-image.png).
// Run: node scripts/generate-og.mjs
import { createCanvas, GlobalFonts, Path2D } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const W = 1200;
const H = 630;

const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// Pick a bold system font that exists on Windows/macOS/Linux.
const FONT =
  GlobalFonts.families.find((f) => /Segoe UI|Arial|Helvetica|DejaVu Sans|Liberation Sans/i.test(f.family))
    ?.family || "sans-serif";

// ── Background ─────────────────────────────────────────────
const base = ctx.createLinearGradient(0, 0, W, H);
base.addColorStop(0, "#0f1020");
base.addColorStop(0.55, "#171634");
base.addColorStop(1, "#0d1030");
ctx.fillStyle = base;
ctx.fillRect(0, 0, W, H);

function glow(x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
glow(985, 115, 560, "rgba(124,58,237,0.55)");
glow(150, 585, 520, "rgba(37,99,235,0.42)");

// Faint grid
ctx.strokeStyle = "rgba(255,255,255,0.04)";
ctx.lineWidth = 1;
for (let x = 0; x <= W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
for (let y = 0; y <= H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

// ── Logo tile ──────────────────────────────────────────────
const LX = 90, LY = 84, LS = 108, R = 26;
const tile = ctx.createLinearGradient(LX, LY, LX + LS, LY + LS);
tile.addColorStop(0, "#8b5cf6");
tile.addColorStop(1, "#6366f1");
ctx.save();
ctx.shadowColor = "rgba(124,58,237,0.55)";
ctx.shadowBlur = 45;
ctx.shadowOffsetY = 18;
ctx.fillStyle = tile;
ctx.beginPath();
ctx.roundRect(LX, LY, LS, LS, R);
ctx.fill();
ctx.restore();

// Wrench icon (lucide "wrench" path), scaled into the tile.
const wrench = new Path2D(
  "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
);
ctx.save();
const pad = 27; // icon inset
const scale = (LS - pad * 2) / 24;
ctx.translate(LX + pad, LY + pad);
ctx.scale(scale, scale);
ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 2.2;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.stroke(wrench);
ctx.restore();

// ── Wordmark ───────────────────────────────────────────────
ctx.textBaseline = "alphabetic";
ctx.font = `800 64px "${FONT}"`;
const wordY = LY + LS / 2 + 22;
const wordX = LX + LS + 26;
ctx.fillStyle = "#ffffff";
ctx.fillText("Tool", wordX, wordY);
const toolW = ctx.measureText("Tool").width;
ctx.fillStyle = "#a78bfa";
ctx.fillText("Snapy", wordX + toolW, wordY);

// ── Heading ────────────────────────────────────────────────
ctx.font = `800 82px "${FONT}"`;
ctx.fillStyle = "#ffffff";
ctx.fillText("Free Online Tools", 90, 356);

const l2y = 448;
const grad = ctx.createLinearGradient(90, 0, 640, 0);
grad.addColorStop(0, "#a78bfa");
grad.addColorStop(1, "#60a5fa");
ctx.fillStyle = grad;
ctx.fillText("100% Private", 90, l2y);
const privW = ctx.measureText("100% Private").width;
ctx.font = `500 44px "${FONT}"`;
ctx.fillStyle = "#d7d9ef";
ctx.fillText(" no installs, no signup", 90 + privW + 26, l2y);

// ── Tagline ────────────────────────────────────────────────
ctx.font = `500 33px "${FONT}"`;
ctx.fillStyle = "#c7c9e0";
ctx.fillText("PDF · Image · Text · Calculators · Instant Share & more", 90, 512);

// ── Pills ──────────────────────────────────────────────────
ctx.font = `700 26px "${FONT}"`;
let px = 90;
const py = 552, ph = 52;
for (const label of ["No signup", "No uploads", "Free forever"]) {
  const tw = ctx.measureText(label).width;
  const pw = tw + 56;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, ph / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e9e9ff";
  ctx.fillText(label, px + 28, py + ph / 2 + 9);
  px += pw + 16;
}

const out = join(__dirname, "..", "public", "og-image.png");
writeFileSync(out, canvas.toBuffer("image/png"));
console.log("Wrote", out);
