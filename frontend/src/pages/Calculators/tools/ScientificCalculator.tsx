/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useEffect, useCallback } from "react";
import { evaluate, format as mathFormat } from "mathjs";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "./ScientificCalculator.module.css";

type AngleMode = "DEG" | "RAD";

interface BtnDef {
  label: string;
  action: string;
  type: "mem" | "sci" | "num" | "op" | "eq" | "clear" | "util";
  colSpan?: number;
  sectionStart?: boolean; // draws separator line above this button
}

const CalcIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="9" y1="11" x2="9" y2="11"/>
    <line x1="12" y1="11" x2="12" y2="11"/>
    <line x1="15" y1="11" x2="15" y2="11"/>
    <line x1="9" y1="15" x2="9" y2="15"/>
    <line x1="12" y1="15" x2="12" y2="15"/>
    <line x1="15" y1="15" x2="15" y2="15"/>
    <line x1="9" y1="19" x2="15" y2="19"/>
  </svg>
);

/* ── Safe expression evaluator ──────────────────────────── */
function evalExpr(expr: string, mode: AngleMode): string {
  if (!expr.trim()) return "";
  try {
    const e = expr.replace(/×/g, "*").replace(/÷/g, "/");
    let result: number | string;
    if (mode === "DEG") {
      const degScope = {
        sin:  (x: number) => Math.sin(x * Math.PI / 180),
        cos:  (x: number) => Math.cos(x * Math.PI / 180),
        tan:  (x: number) => Math.tan(x * Math.PI / 180),
        asin: (x: number) => Math.asin(x) * 180 / Math.PI,
        acos: (x: number) => Math.acos(x) * 180 / Math.PI,
        atan: (x: number) => Math.atan(x) * 180 / Math.PI,
      };
      result = evaluate(e, degScope) as number;
    } else {
      result = evaluate(e) as number;
    }
    if (typeof result !== "number") return String(result);
    if (!isFinite(result)) return "Error";
    return mathFormat(result, { precision: 12 });
  } catch {
    return "Error";
  }
}

/* ── Button definitions ──────────────────────────────────── */
const BUTTONS: BtnDef[] = [
  // ── SCIENTIFIC SECTION ──────────────────────────────────
  // Row 1: Memory
  { label: "MC",    action: "mc",      type: "mem" },
  { label: "MR",    action: "mr",      type: "mem" },
  { label: "M+",    action: "m+",      type: "mem" },
  { label: "M-",    action: "m-",      type: "mem" },
  { label: "MS",    action: "ms",      type: "mem" },
  // Row 2: Primary trig
  { label: "sin",   action: "sin(",    type: "sci" },
  { label: "cos",   action: "cos(",    type: "sci" },
  { label: "tan",   action: "tan(",    type: "sci" },
  { label: "log",   action: "log10(",  type: "sci" },
  { label: "ln",    action: "log(",    type: "sci" },
  // Row 3: Inverse trig + roots
  { label: "sin\u207b\u00b9", action: "asin(",   type: "sci" },
  { label: "cos\u207b\u00b9", action: "acos(",   type: "sci" },
  { label: "tan\u207b\u00b9", action: "atan(",   type: "sci" },
  { label: "\u221a",     action: "sqrt(",   type: "sci" },
  { label: "\u221b",     action: "cbrt(",   type: "sci" },
  // Row 4: Powers, constants, factorial
  { label: "x\u00b2",    action: "^2",      type: "sci" },
  { label: "x\u02b8",    action: "^",       type: "sci" },
  { label: "\u03c0",     action: "pi",      type: "sci" },
  { label: "e",     action: "e",       type: "sci" },
  { label: "n!",    action: "!",       type: "sci" },
  // Row 5: Grouping + misc
  { label: "(",     action: "(",       type: "sci" },
  { label: ")",     action: ")",       type: "sci" },
  { label: "mod",   action: " mod ",   type: "sci" },
  { label: "1/x",   action: "1/(",     type: "sci" },
  { label: "%",     action: "/100",    type: "sci" },

  // ── NORMAL CALCULATOR SECTION ────────────────────────────
  // Row 6: Utility + two operators (separator line above)
  { label: "\u00b1",     action: "negate",  type: "util", sectionStart: true },
  { label: "\u232b",     action: "bksp",    type: "util", sectionStart: true },
  { label: "C",     action: "clear",   type: "clear", sectionStart: true },
  { label: "\u00f7",     action: "/",       type: "op",   sectionStart: true },
  { label: "\u00d7",     action: "*",       type: "op",   sectionStart: true },
  // Row 7: 7-9 + two operators
  { label: "7",     action: "7",       type: "num" },
  { label: "8",     action: "8",       type: "num" },
  { label: "9",     action: "9",       type: "num" },
  { label: "\u2212",     action: "-",       type: "op"  },
  { label: "+",     action: "+",       type: "op"  },
  // Row 8: 4-6 + decimal + equals
  { label: "4",     action: "4",       type: "num" },
  { label: "5",     action: "5",       type: "num" },
  { label: "6",     action: "6",       type: "num" },
  { label: ".",     action: ".",       type: "num" },
  { label: "=",     action: "=",       type: "eq"  },
  // Row 9: 1-3 + 0 (spans 2 cols)
  { label: "1",     action: "1",       type: "num" },
  { label: "2",     action: "2",       type: "num" },
  { label: "3",     action: "3",       type: "num" },
  { label: "0",     action: "0",       type: "num", colSpan: 2 },
];

/* ── Component ──────────────────────────────────────────── */
const ScientificCalculator = () => {
  const [expr, setExpr]       = useState("");
  const [result, setResult]   = useState("");
  const [memory, setMemory]   = useState(0);
  const [mode, setMode]       = useState<AngleMode>("DEG");
  const [evaluated, setEvaluated] = useState(false);

  // Live preview   only show a result if the expression is valid and complete.
  // Never show "Error" while typing; errors only surface when = is pressed.
  useEffect(() => {
    if (!expr) { setResult(""); return; }
    const r = evalExpr(expr, mode);
    setResult(r === "Error" || r === expr ? "" : r);
  }, [expr, mode]);

  const append = useCallback((token: string) => {
    setExpr(prev => {
      // If last action was "=" and user types a digit, start fresh
      if (evaluated && /^[0-9.]$/.test(token)) {
        setEvaluated(false);
        return token;
      }
      setEvaluated(false);
      return prev + token;
    });
  }, [evaluated]);

  const handleBtn = useCallback((action: string) => {
    switch (action) {
      case "clear":
        setExpr(""); setResult(""); setEvaluated(false);
        break;
      case "bksp":
        setExpr(p => p.slice(0, -1));
        setEvaluated(false);
        break;
      case "=": {
        const r = evalExpr(expr, mode);
        if (r !== "Error" && r !== "") {
          setExpr(r); setResult(""); setEvaluated(true);
        } else {
          setResult("Error");
        }
        break;
      }
      case "mc": setMemory(0); break;
      case "mr": append(String(memory)); break;
      case "ms": {
        const r = evalExpr(expr, mode);
        if (r !== "Error" && r) setMemory(parseFloat(r));
        break;
      }
      case "m+": {
        const r = evalExpr(expr, mode);
        if (r !== "Error" && r) setMemory(p => p + parseFloat(r));
        break;
      }
      case "m-": {
        const r = evalExpr(expr, mode);
        if (r !== "Error" && r) setMemory(p => p - parseFloat(r));
        break;
      }
      case "negate":
        setExpr(p => {
          if (!p) return "-";
          if (p.startsWith("-(") && p.endsWith(")")) return p.slice(2, -1);
          return "-(" + p + ")";
        });
        break;
      default:
        append(action);
    }
  }, [expr, mode, memory, append]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key >= "0" && e.key <= "9") { handleBtn(e.key); return; }
      const keyMap: Record<string, string> = {
        "+": "+", "-": "-", "*": "*", ".": ".",
        "(": "(", ")": ")", "^": "^", "%": "/100",
        "Enter": "=", "=": "=",
        "Backspace": "bksp", "Escape": "clear",
      };
      if (e.key === "/" ) { e.preventDefault(); handleBtn("/"); return; }
      if (keyMap[e.key]) handleBtn(keyMap[e.key]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleBtn]);

  const btnClass = (type: BtnDef["type"]) => {
    const map: Record<BtnDef["type"], string> = {
      mem:   s.btnMem,
      sci:   s.btnSci,
      num:   s.btnNum,
      op:    s.btnOp,
      eq:    s.btnEq,
      clear: s.btnClear,
      util:  s.btnUtil,
    };
    return `${s.btn} ${map[type]}`;
  };

  return (
    <ToolPageShell
      backTo="/calculators"
      backLabel="Calculators"
      icon={<CalcIcon />}
      iconColor="#059669"
      iconBg="#ecfdf5"
      title="Scientific Calculator"
      description="Full scientific calculator with sin, cos, tan, log, ln, powers, roots, factorials and memory. Supports keyboard input."
    >
      <div className={s.wrapper}>
        {/* Display */}
        <div className={s.display}>
          <div className={s.displayTop}>
            <span className={s.memLabel}>{memory !== 0 ? `M: ${memory}` : ""}</span>
            <button
              className={s.modeToggle}
              onClick={() => setMode(m => m === "DEG" ? "RAD" : "DEG")}
            >
              {mode}
            </button>
          </div>
          <div className={s.exprLine}>{expr || "0"}</div>
          {result === "Error"
            ? <div className={s.errorLine}>Error</div>
            : result
              ? <div className={s.resultLine}>= {result}</div>
              : <div className={s.resultLine} />
          }
        </div>

        {/* Buttons */}
        <div className={s.grid}>
          {BUTTONS.map((btn, i) => (
            <button
              key={i}
              className={`${btnClass(btn.type)}${btn.sectionStart ? " " + s.btnSep : ""}`}
              style={btn.colSpan ? { gridColumn: `span ${btn.colSpan}` } : undefined}
              onClick={() => handleBtn(btn.action)}
              aria-label={btn.label}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </ToolPageShell>
  );
};

export default ScientificCalculator;
