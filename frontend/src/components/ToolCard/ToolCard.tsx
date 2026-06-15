import { Link } from "react-router-dom";
import styles from "./ToolCard.module.css";

interface ToolCardProps {
  to: string;
  title: string;
  description: string;
}

const ToolCard = ({ to, title, description }: ToolCardProps) => (
  <Link to={to} className={styles.card}>
    <div className={styles.header}>
      <h3 className={styles.title}>{title}</h3>
      <span className={styles.iconBadge} aria-hidden="true">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </span>
    </div>

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

export default ToolCard;
