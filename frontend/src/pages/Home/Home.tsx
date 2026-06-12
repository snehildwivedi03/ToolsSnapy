import styles from "./Home.module.css";

// Static category data — no routing or tool logic yet
const CATEGORIES = [
  {
    id: "pdf",
    icon: "📄",
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files.",
  },
  {
    id: "images",
    icon: "🖼️",
    title: "Image Tools",
    description: "Resize, crop, convert, and optimise images.",
  },
  {
    id: "text",
    icon: "✏️",
    title: "Text Tools",
    description: "Count words, format, encode, and transform text.",
  },
  {
    id: "calculators",
    icon: "🧮",
    title: "Calculators",
    description: "Finance, maths, unit conversion, and more.",
  },
  {
    id: "utilities",
    icon: "🔧",
    title: "Utilities",
    description: "QR codes, colour pickers, timestamps, and extras.",
  },
] as const;

const Home = () => {
  return (
    <article className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.logoMark} aria-hidden="true">
          TS
        </div>
        <h1 id="hero-title" className={styles.heroTitle}>
          Essential tools. <span className={styles.heroAccent}>Instantly.</span>
        </h1>
        <p className={styles.heroDesc}>
          A collection of simple utilities for PDFs, images, text processing,
          calculators, and everyday tasks.
        </p>
      </section>

      {/* Category cards */}
      <section className={styles.categories} aria-labelledby="categories-title">
        <h2 id="categories-title" className={styles.sectionTitle}>
          Browse by category
        </h2>
        <ul className={styles.grid} role="list">
          {CATEGORIES.map((cat) => (
            <li key={cat.id} className={styles.card}>
              <span className={styles.cardIcon} aria-hidden="true">
                {cat.icon}
              </span>
              <h3 className={styles.cardTitle}>{cat.title}</h3>
              <p className={styles.cardDesc}>{cat.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default Home;
