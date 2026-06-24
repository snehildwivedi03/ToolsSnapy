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
  try {
    JSON.parse(text);
    return { valid: true, issues: [] };
  } catch { /* fall through to heuristic analysis */ }

  const issues: JsonIssue[] = [];
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

// ── repairJson ────────────────────────────────────────────────────────────────

export function repairJson(text: string): JsonRepairResult {
  let s = text;
  const fixes: string[] = [];

  const apply = (label: string, fn: (t: string) => string): void => {
    const result = fn(s);
    if (result !== s) {
      fixes.push(label);
      s = result;
    }
  };

  // 1. Remove BOM
  apply("Remove BOM", (t) => t.replace(/^\uFEFF/, ""));

  // 2. Remove single-line comments
  apply("Remove single-line comments", (t) => t.replace(/\/\/[^\n]*/g, ""));

  // 3. Remove block comments
  apply("Remove block comments", (t) => t.replace(/\/\*[\s\S]*?\*\//g, ""));

  // 4. Remove double commas (iterate until none remain)
  apply("Remove double commas", (t) => {
    let prev = "";
    while (prev !== t) {
      prev = t;
      t = t.replace(/,(\s*),/g, ",$1");
    }
    return t;
  });

  // 5. Remove trailing commas before } or ] (iterate until none remain)
  apply("Remove trailing commas", (t) => {
    let prev = "";
    while (prev !== t) {
      prev = t;
      t = t.replace(/,(\s*[}\]])/g, "$1");
    }
    return t;
  });

  // 6. Fix empty collections with stray commas: {,} → {}
  apply("Fix empty collections with stray commas", (t) =>
    t.replace(/([{[])\s*,\s*([}\]])/g, "$1$2"),
  );

  // 7. Quote unquoted keys: { key: → { "key":
  apply("Add quotes to unquoted keys", (t) =>
    t.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3'),
  );

  // 8. Fix common unquoted boolean/null values
  apply("Fix unquoted boolean/null values", (t) =>
    t
      .replace(/:\s*(enabled|yes|on)\b/gi, ": true")
      .replace(/:\s*(disabled|no|off)\b/gi, ": false")
      .replace(/:\s*undefined\b/gi, ": null"),
  );

  // 9. Remove leading zeros from number values (: 0123 → : 123)
  apply("Remove leading zeros from numbers", (t) =>
    t.replace(/(:\s*)(0+)([1-9]\d*)/g, "$1$3"),
  );

  // Final: attempt to parse and pretty-print
  let valid = false;
  try {
    const parsed = JSON.parse(s) as unknown;
    valid = true;
    s = JSON.stringify(parsed, null, 2);
    fixes.push("Formatted and pretty-printed");
  } catch { /* partial repair — return as-is */ }

  return { valid, repairedJson: s, fixes };
}
