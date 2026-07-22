/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import ToolSearch from "../../components/ToolSearch/ToolSearch";
import styles from "./Home.module.css";

/* ── Category icon components ────────────────────────────── */
const PdfIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const TextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

const CalcIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="9" y1="11" x2="9" y2="11"/>
    <line x1="12" y1="11" x2="12" y2="11"/>
    <line x1="15" y1="11" x2="15" y2="11"/>
    <line x1="9" y1="15" x2="9" y2="15"/>
    <line x1="12" y1="15" x2="12" y2="15"/>
    <line x1="15" y1="15" x2="15" y2="15"/>
    <line x1="9" y1="19" x2="15" y2="19"/>
  </svg>
);

const UtilIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 15.5 14"/>
  </svg>
);

/* ── Static data ─────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "images",
    to: "/images",
    title: "Image Tools",
    description: "Resize, crop, convert and optimise images.",
    icon: <ImageIcon />,
    toolCount: 5,
    iconColor: "#6f4e37",
    iconBg: "#faf6f1",
  },
  {
    id: "pdf",
    to: "/pdf",
    title: "PDF Tools",
    description: "Merge, split and convert PDF files.",
    icon: <PdfIcon />,
    toolCount: 4,
    iconColor: "#dc2626",
    iconBg: "#fef2f2",
  },
  {
    id: "share",
    to: "/share",
    title: "Instant Share",
    description: "Share files, links and snippets instantly. No login, no storage.",
    icon: <ShareIcon />,
    toolCount: 5,
    iconColor: "#d97706",
    iconBg: "#fffbeb",
  },
  {
    id: "utilities",
    to: "/utilities",
    title: "Utilities & Dev Tools",
    description: "Converters, generators, encoders and developer helpers.",
    icon: <UtilIcon />,
    toolCount: 13,
    iconColor: "#0891b2",
    iconBg: "#ecfeff",
  },
  {
    id: "calculators",
    to: "/calculators",
    title: "Calculators",
    description: "Finance, maths, scientific and health calculators.",
    icon: <CalcIcon />,
    toolCount: 9,
    iconColor: "#059669",
    iconBg: "#ecfdf5",
  },
  {
    id: "text",
    to: "/text",
    title: "Text Tools",
    description: "Count words, format, encode and transform text.",
    icon: <TextIcon />,
    toolCount: 6,
    iconColor: "#2563eb",
    iconBg: "#eff6ff",
  },
  {
    id: "clock",
    to: "/clock",
    title: "Clock & Calendar",
    description: "Analog & digital clock, world clock, stopwatch, timer, alarm and calendar.",
    icon: <ClockIcon />,
    toolCount: 6,
    iconColor: "#6f4e37",
    iconBg: "#faf6f1",
  },
] as const;

/* ── Page component ──────────────────────────────────────── */
const Home = () => {
  const location = useLocation();
  const toolsRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState(new Date());

  /* Scroll to tools section when navigating home from a tool page */
  useEffect(() => {
    if ((location.state as { scrollToTools?: boolean } | null)?.scrollToTools) {
      requestAnimationFrame(() => {
        toolsRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      /* Clear the state so reload / back won’t re-trigger the scroll */
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmtIST = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(now);

  const timeStr = fmtIST({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = fmtIST({ weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className={styles.page}>

      {/* ── Hero — split layout ── */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroInner}>

          {/* Left — copy */}
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              <span className={styles.badgeItem}>Free forever</span>
              <span className={styles.badgeSep} aria-hidden="true">&middot;</span>
              <span className={styles.badgeItem}>In-browser</span>
              <span className={styles.badgeSep} aria-hidden="true">&middot;</span>
              <span className={styles.badgeItem}>No sign-up</span>
            </div>

            <h1 id="hero-title" className={styles.heroTitle}>
              Every tool you need.
              <span className={styles.heroAccent}> Nothing you upload leaves.</span>
            </h1>

            <p className={styles.heroSub}>
              PDFs, images, text, calculators and everyday utilities — processed
              instantly and privately in your browser. No accounts, no uploads,
              no tracking.
            </p>

            <div className={styles.heroActions}>
              <button
                className={styles.ctaPrimary}
                onClick={() => toolsRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse all tools
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <Link to="/share" className={styles.ctaSecondary}>
                Try Instant Share
              </Link>
            </div>

            <div className={styles.heroStats} role="list">
              <div className={styles.statItem} role="listitem">
                <span className={styles.statNum}>48+</span>
                <span className={styles.statLabel}>Free tools</span>
              </div>
              <span className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem} role="listitem">
                <span className={styles.statNum}>100%</span>
                <span className={styles.statLabel}>In your browser</span>
              </div>
              <span className={styles.statDivider} aria-hidden="true" />
              <div className={styles.statItem} role="listitem">
                <span className={styles.statNum}>Zero</span>
                <span className={styles.statLabel}>Data collected</span>
              </div>
            </div>
          </div>

          {/* Right — dynamic layered visual */}
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualStage}>

              {/* Morphing organic blobs */}
              <span className={`${styles.blobShape} ${styles.blobMain}`} />
              <span className={`${styles.blobShape} ${styles.blobAccent}`} />
              <span className={`${styles.blobShape} ${styles.blobLight}`} />

              {/* Rotating rings */}
              <span className={styles.ringOuter} />
              <span className={styles.ringInner} />

              {/* Center logo core */}
              <div className={styles.logoCore}>
                <img src="/favicon.png" alt="" className={styles.logoImg} draggable="false" />
              </div>

              {/* Orbiting tool chips */}
              <img src="/pdf.png"        className={`${styles.orbImg} ${styles.orb1}`} alt="" loading="lazy" draggable="false" />
              <img src="/image.png"      className={`${styles.orbImg} ${styles.orb2}`} alt="" loading="lazy" draggable="false" />
              <img src="/calculator.png" className={`${styles.orbImg} ${styles.orb3}`} alt="" loading="lazy" draggable="false" />
              <img src="/code.png"       className={`${styles.orbImg} ${styles.orb4}`} alt="" loading="lazy" draggable="false" />
              <img src="/clock.png"      className={`${styles.orbImg} ${styles.orb5}`} alt="" loading="lazy" draggable="false" />

              {/* Glass clock card */}
              <div className={styles.floatClock}>
                <span className={styles.floatClockTime}>{timeStr}</span>
                <span className={styles.floatClockDate}>{dateStr} · IST</span>
              </div>

              {/* Glass privacy card */}
              <div className={styles.floatPrivacy}>
                <span className={styles.floatPrivacyIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className={styles.floatPrivacyText}>
                  <strong>Processed locally</strong>
                  <span>Files never leave your device</span>
                </span>
              </div>

              {/* Decorative accents */}
              <span className={`${styles.deco} ${styles.dotGrid}`} />
              <span className={`${styles.deco} ${styles.sparkle}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c.6 5.4 3.6 8.4 9 9-5.4.6-8.4 3.6-9 9-.6-5.4-3.6-8.4-9-9 5.4-.6 8.4-3.6 9-9z" />
                </svg>
              </span>

            </div>
          </div>

        </div>
      </section>

      {/* ── USP: four big bold headings ── */}
      <section className={styles.usp} aria-labelledby="usp-title">

        <div className={styles.uspIntro}>
          <span className={styles.uspLabel}>Why ToolSnapy</span>
          <h2 id="usp-title" className={styles.uspTitle}>
            Your privacy, guaranteed.
          </h2>
        </div>

        <ul className={styles.uspList} role="list">
          <li className={styles.uspItem}>
            <span className={styles.uspNum} aria-hidden="true">01</span>
            <div>
              <h3 className={styles.uspHeading}>No tracking.</h3>
              <p className={styles.uspDesc}>
                Zero data collected. No analytics, no cookies,
                no fingerprinting. Ever.
              </p>
            </div>
          </li>

          <li className={styles.uspItem}>
            <span className={styles.uspNum} aria-hidden="true">02</span>
            <div>
              <h3 className={styles.uspHeading}>No cloud.</h3>
              <p className={styles.uspDesc}>
                Everything runs in your browser. Your files
                never leave your device.
              </p>
            </div>
          </li>

          <li className={styles.uspItem}>
            <span className={styles.uspNum} aria-hidden="true">03</span>
            <div>
              <h3 className={styles.uspHeading}>No history.</h3>
              <p className={styles.uspDesc}>
                Your files and inputs are never logged,
                stored, or accessible after you leave.
              </p>
            </div>
          </li>

          <li className={styles.uspItem}>
            <span className={styles.uspNum} aria-hidden="true">04</span>
            <div>
              <h3 className={styles.uspHeading}>No permanent saves.</h3>
              <p className={styles.uspDesc}>
                Upload, process, download. Your files
                are never stored permanently on our servers.
              </p>
            </div>
          </li>
        </ul>

        <div className={styles.uspTagline}>
          <p>You upload. You work. You leave. Until next time.</p>
        </div>

      </section>

      {/* ── Category grid ── */}
      <section
        ref={toolsRef}
        id="tools"
        className={styles.categories}
        aria-labelledby="categories-title"
      >
        <div className={styles.sectionHeader}>
          <h2 id="categories-title" className={styles.sectionTitle}>
            Browse by category
          </h2>
          <p className={styles.sectionSub}>
            Pick the category that matches your task.
          </p>
        </div>

        <div className={styles.searchWrap}>
          <ToolSearch placeholder="Search all tools…" />
        </div>

        <ul className={styles.grid} role="list">
          {CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <CategoryCard {...cat} />
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
};

export default Home;