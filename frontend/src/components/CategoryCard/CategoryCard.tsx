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
    <Link to={to} className={styles.card}>
      <div
        className={styles.iconWrap}
        style={{ backgroundColor: iconBg, color: iconColor }}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{description}</p>
      </div>

      <div className={styles.footer}>
        <span className={styles.count}>{toolCount} tools</span>
        <svg
          className={styles.arrow}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
};

export default CategoryCard;