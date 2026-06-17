import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ToolCard from "../../components/ToolCard/ToolCard";
import Masonry from "../../components/Masonry/Masonry";
import styles from "./Pdf.module.css";

const SCROLL_KEY = "pdf-scroll-pos";

const PDF_TOOLS = [
  {
    id: "pdf-merge",
    to: "/pdf/merge",
    title: "Merge PDF",
    description:
      "Combine several PDFs into one document. Drag to reorder pages, then download. Nothing leaves your browser.",
  },
  {
    id: "pdf-split",
    to: "/pdf/split",
    title: "Split & Extract PDF",
    description:
      "Pull specific pages or ranges out of a PDF into a brand-new file. Type 1-3, 5, 8-10 and you're done.",
  },
  {
    id: "pdf-images-to-pdf",
    to: "/pdf/images-to-pdf",
    title: "Images to PDF",
    description:
      "Turn JPG, PNG or WebP images into a single PDF, one image per page, in the order you choose.",
  },
  {
    id: "pdf-to-images",
    to: "/pdf/pdf-to-images",
    title: "PDF to Images",
    description:
      "Export every page of a PDF as a high-resolution PNG or JPG. Download pages individually or all at once.",
  },
] as const;

const OTHER_CATEGORIES = [
  { to: "/text",        label: "Text Tools",             color: "#2563eb" },
  { to: "/images",      label: "Image Tools",            color: "#7c3aed" },
  { to: "/calculators", label: "Calculators",            color: "#059669" },
  { to: "/share",       label: "Instant Share",          color: "#d97706" },
  { to: "/utilities",   label: "Utilities & Dev Tools",  color: "#0891b2" },
];

const Pdf = () => {
  const didRestore = useRef(false);

  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved !== null) {
      sessionStorage.removeItem(SCROLL_KEY);
      window.scrollTo({ top: Number(saved), behavior: "instant" as ScrollBehavior });
    }
  }, []);

  const saveScroll = () => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  };

  return (
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
          <svg
            width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </Link>
      </div>

      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h1 className={styles.title}>PDF Tools</h1>
        <p className={styles.description}>
          Merge, split, and convert PDFs right in your browser. Your files are never
          uploaded. Everything happens locally on your device.
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

      <section aria-labelledby="pdf-tools-heading">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="pdf-tools-heading">PDF Tools</h2>
          <span className={styles.sectionCount}>{PDF_TOOLS.length} tools</span>
        </div>
        <Masonry>
          {PDF_TOOLS.map((tool) => (
            <div key={tool.id} onClick={saveScroll}>
              <ToolCard
                to={tool.to}
                title={tool.title}
                description={tool.description}
              />
            </div>
          ))}
        </Masonry>
      </section>
    </div>
  );
};

export default Pdf;
