import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ToolCard from "../../components/ToolCard/ToolCard";
import Masonry from "../../components/Masonry/Masonry";
import { SHARE_TOOLS } from "./shareData";
import styles from "./Share.module.css";
import { getStats, type ShareStats } from "../../services/shareCounter";

const OTHER_CATEGORIES = [
  { to: "/utilities",   label: "Utilities & Dev", color: "#d97706" },
  { to: "/pdf",         label: "PDF Tools",        color: "#dc2626" },
  { to: "/images",      label: "Image Tools",      color: "#7c3aed" },
  { to: "/text",        label: "Text Tools",        color: "#2563eb" },
  { to: "/calculators", label: "Calculators",       color: "#059669" },
];

const SharePage = () => {
  const [stats, setStats] = useState<ShareStats>(getStats);

  // Re-read counter when this tab creates a share (custom event) or another tab updates localStorage
  useEffect(() => {
    const refresh = () => setStats(getStats());
    window.addEventListener("sharestats", refresh);
    window.addEventListener("storage",    refresh);
    return () => {
      window.removeEventListener("sharestats", refresh);
      window.removeEventListener("storage",    refresh);
    };
  }, []);

  return (
  <div className={styles.page}>
    <div className={styles.topBar}>
      <Link to="/" state={{ scrollToTools: true }} className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Home
      </Link>
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
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </div>
      <h1 className={styles.title}>Instant Share</h1>
      <p className={styles.description}>
        Share text, files, images and PDFs instantly with a 6-character code.
        No login. No storage. Links expire in 15 minutes.
      </p>
    </div>

    {/* ── Live stats counter ─────────────────────────────── */}
    <div className={styles.statsRow}>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.files.toLocaleString()}</span>
        <span className={styles.statLabel}>files shared</span>
      </div>
      <div className={styles.statDivider} aria-hidden="true" />
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.texts.toLocaleString()}</span>
        <span className={styles.statLabel}>text shared</span>
      </div>
      <div className={styles.statDivider} aria-hidden="true" />
      <div className={styles.statItem}>
        <span className={`${styles.statNumber} ${styles.statZero}`}>{stats.kept}</span>
        <span className={styles.statLabel}>kept forever</span>
      </div>
    </div>

    {/* Privacy notice */}
    <div className={styles.notice}>
      <svg className={styles.noticeIcon} width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>
        Shared content is stored temporarily on our server and <strong>auto-deleted after 15 minutes</strong>.
        Do not share sensitive, private or confidential data.
      </span>
    </div>

    {/* Explore other categories */}
    <div className={styles.moreCats}>
      <span className={styles.moreLabel}>Explore other tools</span>
      <div className={styles.moreChips}>
        {OTHER_CATEGORIES.map((cat) => (
          <Link key={cat.to} to={cat.to} className={styles.moreChip}>
            <span className={styles.moreDot} style={{ backgroundColor: cat.color }} />
            {cat.label}
          </Link>
        ))}
      </div>
    </div>

    {/* Tool grid */}
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>All Share Tools</h2>
      </div>
      <Masonry>
        {SHARE_TOOLS.map((tool) => (
          <div key={tool.id}>
            <ToolCard
              to={tool.to}
              title={tool.title}
              description={tool.description}
            />
          </div>
        ))}
      </Masonry>
    </div>
  </div>
  );
};

export default SharePage;
