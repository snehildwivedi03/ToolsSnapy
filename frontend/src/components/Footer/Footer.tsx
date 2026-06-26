import styles from "./Footer.module.css";

// Static footer   brand, USP, and auto-updated copyright
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src="/favicon.png" alt="" className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>ToolSnapy</span>
        </div>
        <p className={styles.tagline}>
          No tracking &nbsp;&middot;&nbsp; No history &nbsp;&middot;&nbsp; No saves.
          <span className={styles.taglineBreak}>You exit, we exit.</span>
        </p>
        <p className={styles.copy}>
          &copy; {year} ToolSnapy. Built for speed, built for privacy.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
