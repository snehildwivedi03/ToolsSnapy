import { Children, useEffect, useState, type ReactNode } from "react";
import styles from "./Masonry.module.css";

interface MasonryProps {
  children: ReactNode;
  /** Optional breakpoint overrides: [smallMax, mediumMax] widths in px. */
  className?: string;
}

/** Pick a column count for the current viewport width. */
const columnsForWidth = (width: number): number => {
  if (width >= 1100) return 4;
  if (width >= 768) return 3;
  return 2;
};

/**
 * Lightweight masonry that distributes children across N balanced columns.
 * Unlike CSS `column-count`, every column is always filled (round-robin),
 * so there is never empty space on the right and the layout stays compact.
 */
const Masonry = ({ children, className }: MasonryProps) => {
  const [cols, setCols] = useState<number>(() =>
    typeof window === "undefined" ? 2 : columnsForWidth(window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => setCols(columnsForWidth(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = Children.toArray(children);
  const columns: ReactNode[][] = Array.from({ length: cols }, () => []);
  items.forEach((child, index) => {
    columns[index % cols].push(child);
  });

  return (
    <div className={`${styles.masonry} ${className ?? ""}`.trim()}>
      {columns.map((column, index) => (
        <div className={styles.column} key={index}>
          {column}
        </div>
      ))}
    </div>
  );
};

export default Masonry;
