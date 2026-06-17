export interface ToolEntry {
  id: string;
  title: string;
  description: string;
  to: string;
  category: string;
  keywords?: string[];
}

/** Central registry of every searchable tool across the app. */
export const ALL_TOOLS: ToolEntry[] = [
  // ── Text Tools ──────────────────────────────────────────
  { id: "word-counter", title: "Word Counter", description: "Count words, characters, sentences and paragraphs.", to: "/text/word-counter", category: "Text Tools", keywords: ["count", "words", "reading time"] },
  { id: "character-counter", title: "Character Counter", description: "Detailed character breakdown including letters and digits.", to: "/text/character-counter", category: "Text Tools", keywords: ["count", "chars", "letters"] },
  { id: "case-converter", title: "Case Converter", description: "Convert text to UPPER, lower, Title, camelCase and more.", to: "/text/case-converter", category: "Text Tools", keywords: ["uppercase", "lowercase", "camel", "snake", "kebab"] },
  { id: "json-formatter", title: "JSON Formatter", description: "Format and prettify minified or messy JSON.", to: "/text/json-formatter", category: "Text Tools", keywords: ["json", "prettify", "beautify"] },
  { id: "json-validator", title: "JSON Validator", description: "Validate JSON syntax and get clear error messages.", to: "/text/json-validator", category: "Text Tools", keywords: ["json", "validate", "lint"] },
  { id: "random-paragraph", title: "Random Paragraph Generator", description: "Generate Lorem Ipsum placeholder paragraphs instantly.", to: "/text/random-paragraph", category: "Text Tools", keywords: ["lorem", "ipsum", "placeholder", "dummy"] },

  // ── Image Tools ─────────────────────────────────────────
  { id: "image-resize", title: "Resize to Target Size", description: "Compress an image to an exact file size like 200 KB.", to: "/images/resize", category: "Image Tools", keywords: ["compress", "reduce", "kb", "mb", "file size", "shrink", "optimize"] },
  { id: "image-resizer", title: "Image Resizer", description: "Resize an image to exact pixel dimensions with aspect-ratio lock.", to: "/images/resizer", category: "Image Tools", keywords: ["resize", "dimensions", "width", "height", "pixels", "scale", "px"] },
  { id: "background-remover", title: "Background Remover", description: "Automatically erase the background from any photo.", to: "/images/background-remover", category: "Image Tools", keywords: ["remove background", "transparent", "cutout", "png", "erase"] },
  { id: "image-converter", title: "Image Converter", description: "Convert images between PNG, JPG, WebP, AVIF and SVG.", to: "/images/converter", category: "Image Tools", keywords: ["convert", "png", "jpg", "jpeg", "webp", "avif", "svg", "format"] },
  { id: "image-to-text", title: "Image to Text (OCR)", description: "Extract text from images using optical character recognition.", to: "/images/text-extractor", category: "Image Tools", keywords: ["ocr", "extract", "text", "scan", "recognize", "read", "optical"] },

  // ── PDF Tools ───────────────────────────────────────────
  { id: "pdf-merge", title: "Merge PDF", description: "Combine multiple PDFs into a single document.", to: "/pdf/merge", category: "PDF Tools", keywords: ["combine", "join", "merge", "concat", "pdf"] },
  { id: "pdf-split", title: "Split & Extract PDF", description: "Extract pages or ranges from a PDF into a new file.", to: "/pdf/split", category: "PDF Tools", keywords: ["split", "extract", "pages", "range", "separate", "pdf"] },
  { id: "pdf-images-to-pdf", title: "Images to PDF", description: "Convert JPG, PNG or WebP images into a single PDF.", to: "/pdf/images-to-pdf", category: "PDF Tools", keywords: ["jpg to pdf", "png to pdf", "image", "convert", "pdf"] },
  { id: "pdf-to-images", title: "PDF to Images", description: "Export each PDF page as a PNG or JPG image.", to: "/pdf/pdf-to-images", category: "PDF Tools", keywords: ["pdf to jpg", "pdf to png", "render", "export", "image"] },

  // ── Calculators ─────────────────────────────────────────
  { id: "scientific", title: "Scientific Calculator", description: "Advanced scientific calculator with trig and logs.", to: "/calculators/scientific", category: "Calculators", keywords: ["math", "trig", "log"] },
  { id: "bmi", title: "BMI Calculator", description: "Calculate your Body Mass Index.", to: "/calculators/bmi", category: "Calculators", keywords: ["body", "mass", "health", "weight"] },
  { id: "emi", title: "EMI Calculator", description: "Calculate loan EMI, interest and amortisation.", to: "/calculators/emi", category: "Calculators", keywords: ["loan", "interest", "finance"] },
  { id: "sip", title: "SIP Calculator", description: "Estimate returns on systematic investment plans.", to: "/calculators/sip", category: "Calculators", keywords: ["invest", "mutual fund", "finance"] },
  { id: "calories", title: "Calorie Calculator", description: "Estimate daily calorie needs.", to: "/calculators/calories", category: "Calculators", keywords: ["bmr", "diet", "health"] },
  { id: "percentage", title: "Percentage Calculator", description: "Calculate percentages, increases and decreases.", to: "/calculators/percentage", category: "Calculators", keywords: ["percent", "math"] },
  { id: "age", title: "Age Calculator", description: "Calculate exact age from a birth date.", to: "/calculators/age", category: "Calculators", keywords: ["birthday", "date"] },
  { id: "tip", title: "Tip Calculator", description: "Split bills and calculate tips.", to: "/calculators/tip", category: "Calculators", keywords: ["bill", "gratuity", "split"] },
  { id: "discount", title: "Discount Calculator", description: "Calculate sale prices and savings.", to: "/calculators/discount", category: "Calculators", keywords: ["sale", "off", "price"] },

  // ── Utilities & Dev Tools ───────────────────────────────
  { id: "live-clock", title: "Live Clock", description: "Full-screen world clock with date.", to: "/utilities/live-clock", category: "Utilities", keywords: ["time", "world", "date"] },
  { id: "unit-converter", title: "Unit Converter", description: "Convert length, weight, temperature and more.", to: "/utilities/unit-converter", category: "Utilities", keywords: ["length", "weight", "temperature", "convert"] },
  { id: "password-generator", title: "Password Generator", description: "Generate strong, random passwords.", to: "/utilities/password-generator", category: "Utilities", keywords: ["secure", "random", "strong"] },
  { id: "uuid-generator", title: "UUID Generator", description: "Generate random UUIDs (v4).", to: "/utilities/uuid-generator", category: "Utilities", keywords: ["guid", "id", "random"] },
  { id: "color-picker", title: "Color Picker", description: "Pick colours and copy HEX, RGB and HSL values.", to: "/utilities/color-picker", category: "Utilities", keywords: ["hex", "rgb", "hsl", "colour"] },
  { id: "qr-generator", title: "QR Code Generator", description: "Create QR codes from text or links.", to: "/utilities/qr-generator", category: "Utilities", keywords: ["qrcode", "barcode", "scan"] },
  { id: "barcode-generator", title: "Barcode Generator", description: "Generate barcodes in multiple formats.", to: "/utilities/barcode-generator", category: "Utilities", keywords: ["code128", "ean", "upc"] },
  { id: "jwt-decoder", title: "JWT Decoder", description: "Decode and inspect JSON Web Tokens.", to: "/utilities/jwt-decoder", category: "Developer Tools", keywords: ["token", "auth", "json"] },
  { id: "base64-encoder", title: "Base64 Encoder / Decoder", description: "Encode and decode Base64 strings.", to: "/utilities/base64-encoder", category: "Developer Tools", keywords: ["base64", "encode", "decode"] },
  { id: "sha256", title: "SHA-256 Hash", description: "Generate SHA-256 hashes from text.", to: "/utilities/sha256", category: "Developer Tools", keywords: ["hash", "crypto", "checksum"] },
  { id: "url-encoder", title: "URL Encoder / Decoder", description: "Encode and decode URL components.", to: "/utilities/url-encoder", category: "Developer Tools", keywords: ["uri", "percent", "encode"] },
  { id: "unix-timestamp", title: "Unix Timestamp Converter", description: "Convert between Unix timestamps and dates.", to: "/utilities/unix-timestamp", category: "Developer Tools", keywords: ["epoch", "time", "date"] },

  // ── Instant Share ───────────────────────────────────────
  { id: "share-text", title: "Share Text", description: "Share text snippets with a 6-character code.", to: "/share/text", category: "Instant Share", keywords: ["snippet", "paste", "send"] },
  { id: "share-files", title: "Share Files", description: "Share files or folders instantly.", to: "/share/files", category: "Instant Share", keywords: ["upload", "send", "transfer"] },
  { id: "share-images", title: "Share Images", description: "Share PNG, JPG, JPEG or WEBP images.", to: "/share/images", category: "Instant Share", keywords: ["photo", "picture", "upload"] },
  { id: "share-pdfs", title: "Share PDFs", description: "Share PDF documents instantly.", to: "/share/pdfs", category: "Instant Share", keywords: ["document", "pdf", "upload"] },
  { id: "share-receive", title: "Receive Content", description: "Enter a code to retrieve shared content.", to: "/share/receive", category: "Instant Share", keywords: ["download", "code", "get"] },
];

/** Case-insensitive search across title, description, category and keywords. */
export function searchTools(query: string): ToolEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_TOOLS.filter((t) => {
    const haystack = [
      t.title,
      t.description,
      t.category,
      ...(t.keywords ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
