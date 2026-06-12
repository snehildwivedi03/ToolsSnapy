import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

// Minimal centered header — just the brand, no nav links
const Navbar = () => (
  <header className={styles.header}>
    <div className={styles.nav}>
      <NavLink to="/" className={styles.brand} aria-label="ToolSnapy home">
        <img src="/favicon.png" alt="ToolSnapy" className={styles.brandMark} />
        <span className={styles.brandName}>ToolSnapy</span>
      </NavLink>
    </div>
  </header>
);

export default Navbar;