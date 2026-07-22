/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { NavLink } from "react-router-dom";
import ToolSearch from "../ToolSearch/ToolSearch";
import styles from "./Navbar.module.css";

// Sticky header   brand on the left, tool search on the right
const Navbar = () => (
  <header className={styles.header}>
    <div className={styles.nav}>
      <NavLink to="/" className={styles.brand} aria-label="ToolSnapy home">
        <img src="/favicon.png" alt="ToolSnapy" className={styles.brandMark} />
        <span className={styles.brandName}>ToolSnapy</span>
      </NavLink>
      <div className={styles.search}>
        <ToolSearch variant="compact" placeholder="Search tools…" />
      </div>
    </div>
  </header>
);

export default Navbar;
