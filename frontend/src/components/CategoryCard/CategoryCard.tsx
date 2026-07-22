/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { Link } from "react-router-dom";
import styles from "./CategoryCard.module.css";

interface Props {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  toolCount: number;
  iconColor: string;
  iconBg: string;
}

// Accessible card that links to a tool category
const CategoryCard = ({
  to,
  title,
  description,
  icon,
  toolCount,
  iconColor,
  iconBg,
}: Props) => {
  return (
    <Link
      to={to}
      className={styles.card}
      style={{
        "--card-accent": iconColor,
        "--card-accent-bg": iconBg,
      } as React.CSSProperties}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        {icon}
      </span>

      <span className={styles.body}>
        <span className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.count}>{toolCount} tools</span>
        </span>
        <p className={styles.desc}>{description}</p>
      </span>

      <span className={styles.arrowWrap} aria-hidden="true">
        <svg
          className={styles.arrow}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
};

export default CategoryCard;