import { Link } from "react-router-dom";
import ToolCard from "../../components/ToolCard/ToolCard";
import Masonry from "../../components/Masonry/Masonry";
import s from "./Calculators.module.css";

const OTHER_CATEGORIES = [
  { to: "/pdf",       label: "PDF Tools",          color: "#dc2626" },
  { to: "/images",    label: "Image Tools",         color: "#7c3aed" },
  { to: "/text",      label: "Text Tools",          color: "#2563eb" },
  { to: "/utilities", label: "Utilities & Dev Tools", color: "#0891b2" },
  { to: "/share",       label: "Instant Share", color: "#d97706" },

];

const TOOLS = [
  {
    to:          "/calculators/age",
    title:       "Age & Date Calculator",
    description: "Calculate exact age in years, months and days. Or find the duration between any two dates with a live time counter.",
  },
  {
    to:          "/calculators/scientific",
    title:       "Scientific Calculator",
    description: "Full scientific calc with sin, cos, tan, log, powers, roots, memory and keyboard support.",
  },
  {
    to:          "/calculators/percentage",
    title:       "Percentage Calculator",
    description: "Five percentage modes   X% of Y, what %, % change, add/subtract % in one tool.",
  },
  {
    to:          "/calculators/discount",
    title:       "Discount Calculator",
    description: "Find the final price after a discount, or reverse-calculate the discount percentage.",
  },
  {
    to:          "/calculators/tip",
    title:       "Tip & Bill Splitter",
    description: "Calculate tip amount with preset rates and split the total bill between any number of people.",
  },
  {
    to:          "/calculators/bmi",
    title:       "BMI Calculator",
    description: "Calculate your Body Mass Index with metric or imperial units and get your healthy weight range.",
  },
  {
    to:          "/calculators/calories",
    title:       "Calorie Calculator",
    description: "Find daily calories for maintenance, mild deficit, moderate deficit, and muscle gain.",
  },
  {
    to:          "/calculators/emi",
    title:       "EMI Calculator",
    description: "Calculate monthly loan EMI, total interest payable and full amortization schedule.",
  },
  {
    to:          "/calculators/sip",
    title:       "SIP Calculator",
    description: "Estimate your Systematic Investment Plan returns and projected wealth over time.",
  },
];

const Calculators = () => {
  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <Link to="/" state={{ scrollToTools: true }} className={s.backLink}>
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
        <Link to="/" state={{ scrollToTools: true }} className={s.homeLink} aria-label="Go to home">
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

      <header className={s.header}>
        <h1 className={s.title}>Calculators</h1>
        <p className={s.subtitle}>
          {TOOLS.length} calculators   financial, scientific, health, unit conversion and more.
        </p>
      </header>

      {/* ── Browse other categories ── */}
      <div className={s.moreCats}>
        <span className={s.moreLabel}>Explore other tools</span>
        <div className={s.moreChips}>
          {OTHER_CATEGORIES.map((cat) => (
            <Link key={cat.to} to={cat.to} className={s.moreChip}>
              <span className={s.moreDot} style={{ background: cat.color }} aria-hidden="true" />
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      <Masonry>
        {TOOLS.map(t => (
          <ToolCard key={t.to} to={t.to} title={t.title} description={t.description} />
        ))}
      </Masonry>
    </div>
  );
};

export default Calculators;
