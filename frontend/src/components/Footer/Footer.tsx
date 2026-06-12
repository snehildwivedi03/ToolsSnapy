import styles from "./Footer.module.css";

// Static footer — brand, tagline, and auto-updated year
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>ToolSnapy</span>
        <p className={styles.tagline}>No accounts. No tracking. No clutter.</p>
        <p className={styles.copy}>&copy; {year} ToolSnapy</p>
      </div>
    </footer>
  );
};

export default Footer;
