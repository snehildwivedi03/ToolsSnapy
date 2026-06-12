import { Link } from "react-router-dom";
import styles from "./ToolCard.module.css";

interface ToolCardProps {
  to: string;
  title: string;
  description: string;
}

const ToolCard = ({ to, title, description }: ToolCardProps) => (
  <Link to={to} className={styles.card}>
    <div className={styles.body}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
    </div>
    <span className={styles.cta}>
      Open tool
      <svg
        className={styles.arrow}
        width="16"
        height="16"
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
