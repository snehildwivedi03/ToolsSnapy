import { Link } from "react-router-dom";
import ToolCard from "../../components/ToolCard/ToolCard";
import styles from "./Utilities.module.css";

const TOOLS = [
  {
    id: "live-clock",
    to: "/utilities/live-clock",
    title: "Live Clock",
    description:
      "Real-time clock in Indian Standard Time (IST · UTC+5:30) with 12/24-hour toggle and live seconds.",
  },
] as const;

const OTHER_CATEGORIES = [
  { to: "/pdf",         label: "PDF Tools",            color: "#dc2626" },
  { to: "/images",      label: "Image Tools",           color: "#7c3aed" },
  { to: "/text",        label: "Text Tools",            color: "#2563eb" },
  { to: "/calculators", label: "Calculators",           color: "#059669" },
  { to: "/developer",   label: "Utilities & Dev Tools", color: "#0891b2" },
];

const Utilities = () => (
  <div className={styles.page}>
    <div className={styles.topBar}>
      <Link to="/" state={{ scrollToTools: true }} className={styles.homeLink} aria-label="Go to home">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Home
      </Link>
    </div>

    <div className={styles.header}>
      <div className={styles.headerIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <h1 className={styles.title}>Instant Share</h1>
      <p className={styles.description}>
        Handy everyday utilities — live clock, quick tools and more.
        Everything runs in your browser, nothing stored.
      </p>
    </div>

    {/* ── Browse other categories ── */}
    <div className={styles.moreCats}>
      <span className={styles.moreLabel}>Explore other tools</span>
      <div className={styles.moreChips}>
        {OTHER_CATEGORIES.map((cat) => (
          <Link key={cat.to} to={cat.to} className={styles.moreChip}>
            <span className={styles.moreDot} style={{ background: cat.color }} aria-hidden="true" />
            {cat.label}
          </Link>
        ))}
      </div>
    </div>

    <ul className={styles.grid} role="list">
      {TOOLS.map((tool) => (
        <li key={tool.id}>
          <ToolCard
            to={tool.to}
            title={tool.title}
            description={tool.description}
          />
        </li>
      ))}
    </ul>
  </div>
);

export default Utilities;
