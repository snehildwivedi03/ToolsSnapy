import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { searchTools } from "../../data/toolsRegistry";
import s from "./ToolSearch.module.css";

interface Props {
  /** Visual style: "full" for the page hero, "compact" for the navbar. */
  variant?: "full" | "compact";
  placeholder?: string;
}

const ToolSearch = ({ variant = "full", placeholder = "Search tools…" }: Props) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => searchTools(query).slice(0, 8), [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setActive(0), [query]);

  const go = (to: string) => {
    setQuery("");
    setOpen(false);
    navigate(to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) go(r.to); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div className={`${s.wrap} ${variant === "compact" ? s.compact : ""}`} ref={wrapRef}>
      <div className={s.inputBox}>
        <svg className={s.icon} width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className={s.input}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search tools"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button className={s.clear} onClick={() => { setQuery(""); setOpen(false); }} aria-label="Clear search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className={s.dropdown} role="listbox">
          {results.length === 0 ? (
            <div className={s.empty}>No tools found for “{query}”.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                className={`${s.result} ${i === active ? s.resultActive : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.to)}
                role="option"
                aria-selected={i === active}
              >
                <span className={s.resultTitle}>{r.title}</span>
                <span className={s.resultCat}>{r.category}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ToolSearch;
