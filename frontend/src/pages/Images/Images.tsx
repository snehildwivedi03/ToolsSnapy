import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ToolCard from "../../components/ToolCard/ToolCard";
import Masonry from "../../components/Masonry/Masonry";
import styles from "./Images.module.css";

const SCROLL_KEY = "images-scroll-pos";

const IMAGE_TOOLS = [
  {
    id: "image-resize",
    to: "/images/resize",
    title: "Resize to Target Size",
    description:
      "Compress an image to an exact file size  type 200 KB and get a 200 KB file. Perfect for uploads with size limits.",
  },
  {
    id: "background-remover",
    to: "/images/background-remover",
    title: "Background Remover",
    description:
      "Automatically erase the background from any photo. Runs privately in your browser  no upload needed.",
  },
  {
    id: "image-converter",
    to: "/images/converter",
    title: "Image Converter",
    description:
      "Convert images between PNG, JPG and WebP with adjustable quality. Fast and fully in-browser.",
  },
] as const;

const OTHER_CATEGORIES = [
  { to: "/text",        label: "Text Tools",             color: "#2563eb" },
  { to: "/pdf",         label: "PDF Tools",              color: "#dc2626" },
  { to: "/calculators", label: "Calculators",            color: "#059669" },
  { to: "/utilities",   label: "Instant Share",          color: "#d97706" },
  { to: "/developer",   label: "Utilities & Dev Tools",  color: "#0891b2" },
];

const Images = () => {
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <h1 className={styles.title}>Image Tools</h1>
        <p className={styles.description}>
          Resize to an exact file size, remove backgrounds, and convert formats.
          Everything runs locally  nothing is sent anywhere.
        </p>
      </div>

      {/*  Browse other categories  */}
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

      <Masonry>
        {IMAGE_TOOLS.map((tool) => (
          <div key={tool.id} onClick={saveScroll}>
            <ToolCard
              to={tool.to}
              title={tool.title}
              description={tool.description}
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default Images;
