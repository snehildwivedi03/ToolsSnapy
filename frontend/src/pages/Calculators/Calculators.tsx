import { Link } from "react-router-dom";
import ToolCard from "../../components/ToolCard/ToolCard";
import s from "./Calculators.module.css";

const TOOLS = [
  {
    to:          "/calculators/scientific",
    title:       "Scientific Calculator",
    description: "Full scientific calc with sin, cos, tan, log, powers, roots, memory and keyboard support.",
  },
  {
    to:          "/calculators/bmi",
    title:       "BMI Calculator",
    description: "Calculate your Body Mass Index with metric or imperial units and get your healthy weight range.",
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
  {
    to:          "/calculators/calories",
    title:       "Calorie Calculator",
    description: "Find daily calories for maintenance, mild deficit, moderate deficit, and muscle gain.",
  },
  {
    to:          "/calculators/height",
    title:       "Height Converter",
    description: "Convert height between cm, metres, feet & inches and inches instantly.",
  },
  {
    to:          "/calculators/weight",
    title:       "Weight Converter",
    description: "Convert weight between kg, lbs, grams, ounces and stone with live updates.",
  },
  {
    to:          "/calculators/percentage",
    title:       "Percentage Calculator",
    description: "Five percentage modes — X% of Y, what %, % change, add/subtract % in one tool.",
  },
  {
    to:          "/calculators/age",
    title:       "Age Calculator",
    description: "Find exact age in years, months and days, plus total days lived and next birthday countdown.",
  },
  {
    to:          "/calculators/tip",
    title:       "Tip & Bill Splitter",
    description: "Calculate tip amount with preset rates and split the total bill between any number of people.",
  },
  {
    to:          "/calculators/temperature",
    title:       "Temperature Converter",
    description: "Instantly convert between Celsius, Fahrenheit, Kelvin and Rankine.",
  },
  {
    to:          "/calculators/discount",
    title:       "Discount Calculator",
    description: "Find the final price after a discount, or reverse-calculate the discount percentage.",
  },
];

const Calculators = () => {
  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <Link to="/#tools" className={s.homeLink} aria-label="Go to home">
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
          {TOOLS.length} calculators — financial, scientific, health, unit conversion and more.
        </p>
      </header>

      <div className={s.grid}>
        {TOOLS.map(t => (
          <ToolCard key={t.to} to={t.to} title={t.title} description={t.description} />
        ))}
      </div>
    </div>
  );
};

export default Calculators;
