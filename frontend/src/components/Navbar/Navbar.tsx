import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { to: "/pdf", label: "PDF" },
  { to: "/images", label: "Images" },
  { to: "/text", label: "Text" },
  { to: "/calculators", label: "Calculators" },
  { to: "/utilities", label: "Utilities" },
] as const;

// Sticky top navbar — active route is highlighted via NavLink
const Navbar = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <NavLink to="/" className={styles.brand} aria-label="ToolSnapy home">
          <span className={styles.brandMark} aria-hidden="true">
            TS
          </span>
          <span className={styles.brandName}>ToolSnapy</span>
        </NavLink>

        <ul className={styles.links} role="list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
