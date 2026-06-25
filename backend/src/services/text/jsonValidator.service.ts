import { jsonrepair } from "jsonrepair";
import type {
  JsonValidatorResult,
  JsonRepairResult,
  JsonIssue,
} from "../../types/text.types.js";

// ── String-range helpers ──────────────────────────────────────────────────────

function positionOf(
  text: string,
  index: number,
): { line: number; column: number } {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const column = index - before.lastIndexOf("\n");
  return { line, column };
}

// Returns [start, end] index pairs for every string literal in the text.
// Both endpoints point at the quote character itself.
function findStringRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '"') {
      const start = i++;
      while (i < text.length) {
        if (text[i] === "\\") { i += 2; continue; }
        if (text[i] === '"') break;
        i++;
      }
      ranges.push([start, i]);
      i++; // skip closing quote
    } else {
      i++;
    }
  }
  return ranges;
}

function inString(idx: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([s, e]) => idx > s && idx < e);
}

// ── analyzeJson ───────────────────────────────────────────────────────────────

export function analyzeJson(text: string): JsonValidatorResult {
  // Fast path: valid JSON → no issues
  let parseError: SyntaxError | null = null;
  try {
    JSON.parse(text);
    return { valid: true, issues: [] };
  } catch (e) {
    if (e instanceof SyntaxError) parseError = e;
  }

  const issues: JsonIssue[] = [];

  // ── Primary: surface the native parse error with position ────────────────
  if (parseError) {
    const msg = parseError.message;
    // Modern V8: "… at line N column N"
    const lcMatch = msg.match(/at line (\d+) column (\d+)/);
    // Older V8: "… at position N"
    const posMatch = msg.match(/at position (\d+)/);

    if (lcMatch?.[1] && lcMatch?.[2]) {
      issues.push({
        line: Number(lcMatch[1]),
        column: Number(lcMatch[2]),
        message: msg,
        severity: "error",
      });
    } else if (posMatch?.[1]) {
      const p = positionOf(text, Number(posMatch[1]));
      issues.push({ line: p.line, column: p.column, message: msg, severity: "error" });
    } else {
      issues.push({ line: 1, message: msg, severity: "error" });
    }
  }

  const strings = findStringRanges(text);

  const addIssue = (
    idx: number,
    message: string,
    severity: "error" | "warning" = "error",
  ): void => {
    const { line, column } = positionOf(text, idx);
    issues.push({ line, column, message, severity });
  };

  // Runs regex only against non-string portions of the text
  const scan = (re: RegExp, handler: (m: RegExpExecArray) => void): void => {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (!inString(m.index, strings)) handler(m);
    }
  };

  // 1. Trailing commas before } or ]
  scan(/,(\s*[}\]])/g, (m) =>
    addIssue(m.index, `Trailing comma before '${(m[1] ?? "").trim()}'`),
  );

  // 2. Double commas ,,
  scan(/,,/g, (m) => addIssue(m.index, "Double comma (,,)"));

  // 3. Unquoted object keys
  scan(/[{,]\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, (m) =>
    addIssue(m.index + 1, `Unquoted key: ${m[1]}`),
  );

  // 4. Empty collection with stray comma: {,} or [,]
  scan(/[{[]\s*,\s*[}\]]/g, (m) =>
    addIssue(m.index, "Empty collection with stray comma"),
  );

  // 5. Single-line JS comments
  scan(/\/\/[^\n]*/g, (m) =>
    addIssue(m.index, "Single-line comment (//) is not valid in JSON"),
  );

  // 6. Block comments /* … */
  scan(/\/\*[\s\S]*?\*\//g, (m) =>
    addIssue(m.index, "Block comment (/* */) is not valid in JSON"),
  );

  // 7. Unquoted bareword values (common typos)
  scan(
    /:\s*(enabled|disabled|yes|no|undefined|NaN|Infinity|-Infinity)\b/gi,
    (m) => {
      const val = m[1] ?? "";
      let hint = "";
      if (/^(enabled|yes)$/i.test(val)) hint = " (did you mean true?)";
      else if (/^(disabled|no)$/i.test(val)) hint = " (did you mean false?)";
      else if (/^undefined$/i.test(val)) hint = " (did you mean null?)";
      addIssue(m.index, `Unquoted value: ${val}${hint}`);
    },
  );

  // 8. Leading zeros in numbers (e.g. 0123)
  scan(/:\s*-?0\d+/g, (m) =>
    addIssue(m.index, "Number with leading zero (e.g. 0123 should be 123)"),
  );

  // 9. Unclosed string literals — parser-based: track quote/escape state character by character
  {
    let ci = 0, inStr = false, strStartLine = 1, curLine = 1;
    while (ci < text.length) {
      const ch = text[ci];
      if (inStr) {
        if (ch === "\\") { ci += 2; continue; }
        if (ch === '"') { inStr = false; }
        else if (ch === "\n") {
          issues.push({
            line: strStartLine,
            message: "Unclosed string literal — missing closing quote before line break",
            severity: "error",
          });
          inStr = false;
          curLine++;
        }
      } else {
        if (ch === '"') { inStr = true; strStartLine = curLine; }
        else if (ch === "\n") { curLine++; }
      }
      ci++;
    }
    if (inStr) {
      issues.push({
        line: strStartLine,
        message: "Unclosed string literal — missing closing quote before end of input",
        severity: "error",
      });
    }
  }

  // 10. Missing commas — closing value token followed by newline then a quoted key
  {
    const re = /(["\d}\]]|\btrue\b|\bfalse\b|\bnull\b)([ \t]*\n[ \t]*)(?="[^"]*"\s*:)/g;
    let mc: RegExpExecArray | null;
    while ((mc = re.exec(text)) !== null) {
      if (!inString(mc.index, strings)) {
        const { line } = positionOf(text, mc.index);
        issues.push({ line, message: "Missing comma after property value", severity: "error" });
      }
    }
  }

  // Deduplicate by line+message, then sort by line then column
  const seen = new Set<string>();
  const unique = issues.filter((iss) => {
    const k = `${iss.line}:${iss.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  unique.sort(
    (a, b) => a.line - b.line || (a.column ?? 0) - (b.column ?? 0),
  );

  return { valid: false, issues: unique };
}

// ── closeUnclosedStrings ──────────────────────────────────────────────────────
// Parser-based: walks the text tracking string state. When a bare newline is
// encountered inside a string the string is closed before the newline so the
// content is preserved. Only actually unclosed strings are touched.
function closeUnclosedStrings(text: string): string {
  let result = "";
  let i = 0;
  let inStr = false;
  while (i < text.length) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") {
        result += ch;
        if (i + 1 < text.length) result += text[i + 1];
        i += 2;
        continue;
      }
      if (ch === '"') { inStr = false; result += ch; }
      else if (ch === "\n") { result += '"'; result += ch; inStr = false; }
      else { result += ch; }
    } else {
      if (ch === '"') { inStr = true; result += ch; }
      else { result += ch; }
    }
    i++;
  }
  if (inStr) result += '"';
  return result;
}

// ── repairJson ────────────────────────────────────────────────────────────────

export function repairJson(text: string): JsonRepairResult {
  const fixes: string[] = [];

  // ── Step 0: targeted pre-fixes that jsonrepair sometimes misses ───────────
  // Add missing commas between adjacent object properties.
  // Pattern: closing token + newline + opening quote of a key (quoted string followed by ':')
  const preFix = (label: string, fn: (t: string) => string, src: string): string => {
    const result = fn(src);
    if (result !== src) fixes.push(label);
    return result;
  };

  let preprocessed = text;

  // Step 0a: close unclosed string literals (bare newline inside a string)
  // Uses parser-based approach: only closes strings that are actually unclosed.
  {
    const fixed = closeUnclosedStrings(preprocessed);
    if (fixed !== preprocessed) { fixes.push("Close unclosed string literals"); preprocessed = fixed; }
  }

  // Step 0b: add missing commas between adjacent object properties
  preprocessed = preFix(
    "Add missing commas between adjacent properties",
    (t) => t.replace(
      /(["\d}\]]|\btrue\b|\bfalse\b|\bnull\b)([ \t]*\n[ \t]*)(?="[^"\n]*"\s*:)/g,
      "$1,$2",
    ),
    preprocessed,
  );

  // Step 0c: remove double commas — jsonrepair throws "Colon expected" on ,, inside arrays
  preprocessed = preFix("Remove double commas", (t) => {
    let prev = "";
    while (prev !== t) { prev = t; t = t.replace(/,(\s*),/g, ",$1"); }
    return t;
  }, preprocessed);

  // ── Primary: use jsonrepair for comprehensive structural repair ────────────
  // Handles: unclosed strings, missing brackets/braces, missing commas,
  // trailing commas, double commas, unquoted keys/values, leading zeros,
  // JS comments, Python-style values, and more.
  try {
    const repaired = jsonrepair(preprocessed);
    if (repaired !== text) {
      fixes.push(
        "Repaired structural issues (unclosed strings, missing brackets/braces, " +
        "missing commas, trailing commas, unquoted keys/values, leading zeros, etc.)",
      );
    }
    const parsed = JSON.parse(repaired) as unknown;
    const formatted = JSON.stringify(parsed, null, 2);
    if (formatted !== repaired) fixes.push("Formatted and pretty-printed");
    return { valid: true, repairedJson: formatted, fixes };
  } catch { /* fall through to regex-based fallback */ }

  // ── Fallback: regex-based partial repair ─────────────────────────────────
  let s = preprocessed; // start from pre-fixed version

  const apply = (label: string, fn: (t: string) => string): void => {
    const result = fn(s);
    if (result !== s) { fixes.push(label); s = result; }
  };

  apply("Close unclosed string literals", closeUnclosedStrings);
  // Missing commas (already applied above, but run again on the fallback text)
  apply("Add missing commas between adjacent properties", (t) =>
    t.replace(
      /(["\d}\]]|\btrue\b|\bfalse\b|\bnull\b)([ \t]*\n[ \t]*)(?="[^"\n]*"\s*:)/g,
      "$1,$2",
    ),
  );
  apply("Remove BOM", (t) => t.replace(/^\uFEFF/, ""));
  apply("Remove single-line comments", (t) => t.replace(/\/\/[^\n]*/g, ""));
  apply("Remove block comments", (t) => t.replace(/\/\*[\s\S]*?\*\//g, ""));
  apply("Remove double commas", (t) => {
    let prev = "";
    while (prev !== t) { prev = t; t = t.replace(/,(\s*),/g, ",$1"); }
    return t;
  });
  apply("Remove trailing commas", (t) => {
    let prev = "";
    while (prev !== t) { prev = t; t = t.replace(/,(\s*[}\]])/g, "$1"); }
    return t;
  });
  apply("Fix empty collections with stray commas", (t) =>
    t.replace(/([{[])\s*,\s*([}\]])/g, "$1$2"),
  );
  apply("Add quotes to unquoted keys", (t) =>
    t.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3'),
  );
  apply("Fix unquoted boolean/null values", (t) =>
    t
      .replace(/:\s*(enabled|yes|on)\b/gi, ": true")
      .replace(/:\s*(disabled|no|off)\b/gi, ": false")
      .replace(/:\s*undefined\b/gi, ": null"),
  );
  apply("Remove leading zeros from numbers", (t) =>
    t.replace(/(:\s*)(0+)([1-9]\d*)/g, "$1$3"),
  );

  let valid = false;
  try {
    const parsed = JSON.parse(s) as unknown;
    valid = true;
    s = JSON.stringify(parsed, null, 2);
    fixes.push("Formatted and pretty-printed");
  } catch { /* partial repair — return as-is */ }

  return { valid, repairedJson: s, fixes };
}
