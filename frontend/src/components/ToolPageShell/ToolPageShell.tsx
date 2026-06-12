import { Link } from "react-router-dom";
import styles from "./ToolPageShell.module.css";

interface ToolPageShellProps {
  backTo: string;
  backLabel: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const ToolPageShell = ({
  backTo,
  backLabel,
  icon,
  iconColor,
  iconBg,
  title,
  description,
  children,
}: ToolPageShellProps) => (
  <div className={styles.shell}>
    <div className={styles.topBar}>
      <Link to={backTo} className={styles.backLink}>
        <svg
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
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {backLabel}
      </Link>

      <Link to="/#tools" className={styles.homeLink} aria-label="Go to home">
        <svg
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
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Home
      </Link>
    </div>

    <div className={styles.header}>
      <div
        className={styles.iconWrap}
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
    </div>

    <div className={styles.content}>
      {children}
    </div>
  </div>
);

export default ToolPageShell;
