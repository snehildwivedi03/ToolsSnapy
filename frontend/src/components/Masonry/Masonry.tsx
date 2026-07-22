/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import type { ReactNode } from "react";
import styles from "./Masonry.module.css";

interface MasonryProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive, equal-height card grid. Every card occupies the same cell
 * size regardless of content length, so rows stay clean and aligned.
 * (Kept the original name/API so existing pages need no changes.)
 */
const Masonry = ({ children, className }: MasonryProps) => (
  <div className={`${styles.grid} ${className ?? ""}`.trim()}>{children}</div>
);

export default Masonry;
