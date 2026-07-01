export type UtilSection = "utilities" | "developer";

export interface ToolMeta {
  id: string;
  to: string;
  title: string;
  description: string;
  section: UtilSection;
}

export const UTIL_TOOLS: ToolMeta[] = [
  {
    id: "live-clock",
    to: "/utilities/live-clock",
    title: "Live Date & Time",
    description: "Real-time clock and calendar in IST (UTC+5:30) with 12/24-hour toggle.",
    section: "utilities",
  },
  {
    id: "qr-generator",
    to: "/utilities/qr-generator",
    title: "QR Code Generator",
    description: "Turn any URL or text into a QR code. Download as PNG.",
    section: "utilities",
  },
  {
    id: "password-generator",
    to: "/utilities/password-generator",
    title: "Password Generator",
    description: "Generate strong random passwords with custom length, charset and strength meter.",
    section: "utilities",
  },
  {
    id: "uuid-generator",
    to: "/utilities/uuid-generator",
    title: "UUID Generator",
    description: "Generate v4 UUIDs (RFC 4122) in bulk. Copy one or all at once.",
    section: "utilities",
  },
  {
    id: "unit-converter",
    to: "/utilities/unit-converter",
    title: "Unit Converter",
    description: "Convert Length, Weight, Temperature, Area, Volume and Digital Storage instantly.",
    section: "utilities",
  },
  {
    id: "color-picker",
    to: "/utilities/color-picker",
    title: "Color Picker & Converter",
    description: "Pick any color and get its HEX, RGB and HSL values instantly.",
    section: "utilities",
  },
  {
    id: "barcode-generator",
    to: "/utilities/barcode-generator",
    title: "Barcode Generator",
    description: "Generate CODE-128 barcodes for any text or number. Download as SVG.",
    section: "utilities",
  },
];

export const DEV_TOOLS: ToolMeta[] = [
  {
    id: "jwt-decoder",
    to: "/utilities/jwt-decoder",
    title: "JWT Decoder",
    description: "Decode JWT tokens and inspect header, payload and signature without verification.",
    section: "developer",
  },
  {
    id: "base64-encoder",
    to: "/utilities/base64-encoder",
    title: "Base64 Encoder",
    description: "Encode plain text or URLs to Base64 instantly.",
    section: "developer",
  },
  {
    id: "base64-decoder",
    to: "/utilities/base64-decoder",
    title: "Base64 Decoder",
    description: "Decode Base64 strings back to readable plain text.",
    section: "developer",
  },
  {
    id: "sha256",
    to: "/utilities/sha256",
    title: "SHA-256 Hash Generator",
    description: "Generate a SHA-256 hash from any text using the Web Crypto API.",
    section: "developer",
  },
  {
    id: "url-encoder",
    to: "/utilities/url-encoder",
    title: "URL Encoder / Decoder",
    description: "Encode or decode URL components using percent-encoding standards.",
    section: "developer",
  },
  {
    id: "unix-timestamp",
    to: "/utilities/unix-timestamp",
    title: "Unix Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates in any timezone.",
    section: "developer",
  },
  {
    id: "zip-tool",
    to: "/utilities/zip-tool",
    title: "Zip / Unzip Files",
    description: "Compress files and folders into a ZIP or safely extract one — with built-in zip-bomb and size protection.",
    section: "developer",
  },
  {
    id: "markdown-viewer",
    to: "/utilities/markdown-viewer",
    title: "Markdown Viewer",
    description: "Write or paste Markdown and see a clean live preview. Supports tables, task lists and code blocks.",
    section: "developer",
  },
];

export const ALL_UTIL_TOOLS: ToolMeta[] = [...UTIL_TOOLS, ...DEV_TOOLS];

/** Get all tools in the same section, excluding the given tool id */
export const getRelated = (id: string, section: UtilSection): ToolMeta[] =>
  ALL_UTIL_TOOLS.filter((t) => t.section === section && t.id !== id);
