/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useRef, useEffect, useMemo } from "react";
import styles from "./CurrencyPicker.module.css";

/* ── Build full ISO 4217 currency list from browser Intl APIs ── */
interface Currency { code: string; name: string; symbol: string }

const buildList = (): Currency[] => {
  try {
    const codes = Intl.supportedValuesOf("currency");
    const names = new Intl.DisplayNames(["en"], { type: "currency" });
    return codes
      .map((code) => {
        const symbol =
          new Intl.NumberFormat("en", {
            style: "currency",
            currency: code,
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
            .formatToParts(0)
            .find((p) => p.type === "currency")?.value ?? code;
        return { code, name: names.of(code) ?? code, symbol };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // Fallback list for older environments
    return [
      { code: "USD", name: "US Dollar",         symbol: "$"  },
      { code: "EUR", name: "Euro",               symbol: "€"  },
      { code: "GBP", name: "British Pound",      symbol: "£"  },
      { code: "INR", name: "Indian Rupee",       symbol: "₹"  },
      { code: "JPY", name: "Japanese Yen",       symbol: "¥"  },
      { code: "AUD", name: "Australian Dollar",  symbol: "A$" },
      { code: "CAD", name: "Canadian Dollar",    symbol: "C$" },
      { code: "CHF", name: "Swiss Franc",        symbol: "Fr" },
      { code: "CNY", name: "Chinese Yuan",       symbol: "¥"  },
      { code: "BRL", name: "Brazilian Real",     symbol: "R$" },
    ];
  }
};

const ALL_CURRENCIES = buildList();

/* ── Popular currencies shown at the top ── */
const POPULAR_CODES = ["USD","EUR","GBP","INR","JPY","AUD","CAD","CHF","CNY","BRL","AED","SGD"];
const POPULAR = POPULAR_CODES
  .map((c) => ALL_CURRENCIES.find((x) => x.code === c))
  .filter(Boolean) as Currency[];

export interface CurrencyPickerProps {
  value: string;       // ISO code, e.g. "USD"
  onChange: (code: string, symbol: string) => void;
  label?: string;
}

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CurrencyPicker = ({ value, onChange, label = "Currency" }: CurrencyPickerProps) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = ALL_CURRENCIES.find((c) => c.code === value) ?? ALL_CURRENCIES[0];

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  /* Focus search when dropdown opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null; // null = show popular + all sections
    return ALL_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (c: Currency) => {
    onChange(c.code, c.symbol);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <span className={styles.fieldLabel}>{label}</span>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerSymbol}>{current.symbol}</span>
        <span className={styles.triggerCode}>{current.code}</span>
        <span className={styles.triggerName}>{current.name}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              className={styles.search}
              placeholder="Search currency or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.list}>
            {filtered ? (
              filtered.length > 0 ? (
                filtered.map((c) => (
                  <CurrencyOption key={c.code} c={c} active={c.code === value} onSelect={handleSelect} />
                ))
              ) : (
                <p className={styles.noResults}>No currencies found</p>
              )
            ) : (
              <>
                <p className={styles.sectionLabel}>Popular</p>
                {POPULAR.map((c) => (
                  <CurrencyOption key={c.code} c={c} active={c.code === value} onSelect={handleSelect} />
                ))}
                <p className={styles.sectionLabel}>All currencies</p>
                {ALL_CURRENCIES.map((c) => (
                  <CurrencyOption key={c.code} c={c} active={c.code === value} onSelect={handleSelect} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CurrencyOption = ({
  c, active, onSelect,
}: { c: Currency; active: boolean; onSelect: (c: Currency) => void }) => (
  <button
    type="button"
    role="option"
    aria-selected={active}
    className={`${styles.option} ${active ? styles.optionActive : ""}`}
    onClick={() => onSelect(c)}
  >
    <span className={styles.optSymbol}>{c.symbol}</span>
    <span className={styles.optCode}>{c.code}</span>
    <span className={styles.optName}>{c.name}</span>
    {active && (
      <svg className={styles.optCheck} width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
  </button>
);

export default CurrencyPicker;
