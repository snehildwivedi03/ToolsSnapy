/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.grid}>

          {/* ── Brand column ── */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brand}>
              <img src="/favicon.png" alt="" className={styles.brandMark} aria-hidden="true" />
              <span className={styles.brandName}>ToolSnapy</span>
            </Link>
            <p className={styles.tagline}>
              Free browser-based tools for text, images, PDFs, and more.
              No tracking. No uploads. No history.
            </p>
          </div>

          {/* ── Tools column ── */}
          <div className={styles.linkCol}>
            <p className={styles.colHeading}>Tools</p>
            <nav className={styles.navList}>
              <Link to="/text"        className={styles.navLink}>Text Tools</Link>
              <Link to="/images"      className={styles.navLink}>Image Tools</Link>
              <Link to="/pdf"         className={styles.navLink}>PDF Tools</Link>
              <Link to="/calculators" className={styles.navLink}>Calculators</Link>
              <Link to="/utilities"   className={styles.navLink}>Utilities</Link>
            </nav>
          </div>

          {/* ── Company / Legal column ── */}
          <div className={styles.linkCol}>
            <p className={styles.colHeading}>Company</p>
            <nav className={styles.navList}>
              <Link to="/privacy-policy" className={styles.navLink}>Privacy Policy</Link>
              <Link to="/terms"          className={styles.navLink}>Terms of Use</Link>
            </nav>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {year} ToolSnapy &nbsp;&middot;&nbsp; Built for speed, built for privacy.
          </p>
          <p className={styles.moto}>You exit, we exit.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
