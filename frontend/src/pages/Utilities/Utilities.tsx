import { Link } from "react-router-dom";
import ToolCard from "../../components/ToolCard/ToolCard";
import Masonry from "../../components/Masonry/Masonry";
import styles from "./Utilities.module.css";
import { UTIL_TOOLS, DEV_TOOLS } from "./utilitiesData";

const OTHER_CATEGORIES = [
  { to: "/pdf",         label: "PDF Tools",   color: "#dc2626" },
  { to: "/images",      label: "Image Tools", color: "#6f4e37" },
  { to: "/text",        label: "Text Tools",  color: "#2563eb" },
  { to: "/calculators", label: "Calculators", color: "#059669" },
  { to: "/share",       label: "Instant Share", color: "#d97706" },
];

const Utilities = () => (
  <div className={styles.page}>
    <div className={styles.topBar}>
      <Link to="/" state={{ scrollToTools: true }} className={styles.backLink}>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
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
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <h1 className={styles.title}>Utilities & Dev Tools</h1>
      <p className={styles.description}>
        13 handy tools: converters, generators, encoders and developer helpers.
        Everything runs in your browser, nothing stored.
      </p>
    </div>

    {/* ── Explore other categories ── */}
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

    {/* ── Utilities section ── */}
    <section aria-labelledby="utils-heading">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} id="utils-heading">Utilities</h2>
        <span className={styles.sectionCount}>{UTIL_TOOLS.length} tools</span>
      </div>
      <Masonry>
        {UTIL_TOOLS.map((tool) => (
          <div key={tool.id}>
            <ToolCard to={tool.to} title={tool.title} description={tool.description} />
          </div>
        ))}
      </Masonry>
    </section>

    {/* ── Developer Tools section ── */}
    <section aria-labelledby="dev-heading">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} id="dev-heading">Developer Tools</h2>
        <span className={styles.sectionCount}>{DEV_TOOLS.length} tools</span>
      </div>
      <Masonry>
        {DEV_TOOLS.map((tool) => (
          <div key={tool.id}>
            <ToolCard to={tool.to} title={tool.title} description={tool.description} />
          </div>
        ))}
      </Masonry>
    </section>
  </div>
);

export default Utilities;
