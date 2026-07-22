/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { Link } from "react-router-dom";
import styles from "./ToolCard.module.css";

interface ToolCardProps {
  to: string;
  title: string;
  description: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  text: "Text",
  pdf: "PDF",
  images: "Image",
  calculators: "Calculator",
  utilities: "Utility",
  developer: "Developer",
};

const ToolCard = ({ to, title, description }: ToolCardProps) => {
  const segment = to.split("/").filter(Boolean)[0] ?? "";
  const label = CATEGORY_LABELS[segment] ?? segment;

  return (
    <Link to={to} className={styles.card}>
      <span className={styles.tag}>{label}</span>

      <h3 className={styles.title}>{title}</h3>

      <p className={styles.desc}>{description}</p>

      <span className={styles.cta}>
        Open tool
        <svg
          className={styles.arrow}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </Link>
  );
};

export default ToolCard;
