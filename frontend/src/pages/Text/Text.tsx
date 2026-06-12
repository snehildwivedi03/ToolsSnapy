import { Link } from "react-router-dom";
import ToolCard from "../../components/ToolCard/ToolCard";
import styles from "./Text.module.css";

const TEXT_TOOLS = [
  {
    id: "word-counter",
    to: "/text/word-counter",
    title: "Word Counter",
    description:
      "Count words, characters, sentences, and paragraphs. Includes reading time.",
  },
  {
    id: "character-counter",
    to: "/text/character-counter",
    title: "Character Counter",
    description:
      "Detailed character breakdown: total, no-spaces, letters, digits, and whitespace.",
  },
  {
    id: "case-converter",
    to: "/text/case-converter",
    title: "Case Converter",
    description:
      "Convert text to UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, or kebab-case.",
  },
  {
    id: "json-formatter",
    to: "/text/json-formatter",
    title: "JSON Formatter",
    description:
      "Format and prettify minified or messy JSON with 2- or 4-space indentation.",
  },
  {
    id: "json-validator",
    to: "/text/json-validator",
    title: "JSON Validator",
    description:
      "Validate JSON syntax instantly and get clear error messages when something is wrong.",
  },
  {
    id: "random-paragraph",
    to: "/text/random-paragraph",
    title: "Random Paragraph Generator",
    description:
      "Generate Lorem Ipsum placeholder paragraphs instantly. Choose 1 to 20 and copy.",
  },
] as const;

const OTHER_CATEGORIES = [
  { to: "/pdf",         label: "PDF Tools",             color: "#dc2626" },
  { to: "/images",      label: "Image Tools",            color: "#7c3aed" },
  { to: "/calculators", label: "Calculators",            color: "#059669" },
  { to: "/utilities",   label: "Instant Share",          color: "#d97706" },
  { to: "/developer",   label: "Utilities & Dev Tools",  color: "#0891b2" },
];

const Text = () => (
  <div className={styles.page}>
    <div className={styles.topBar}>
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
      <div className={styles.headerIcon}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      </div>
      <h1 className={styles.title}>Text Tools</h1>
      <p className={styles.description}>
        Word counting, case conversion, JSON formatting and more.
        Everything runs locally  nothing is sent anywhere.
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
      {TEXT_TOOLS.map((tool) => (
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

export default Text;