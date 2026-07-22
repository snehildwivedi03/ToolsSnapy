/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { Link } from "react-router-dom";
import { getRelated, type UtilSection } from "../../pages/Utilities/utilitiesData";
import styles from "./RelatedTools.module.css";

interface Props {
  currentId: string;
  section: UtilSection;
}

const RelatedTools = ({ currentId, section }: Props) => {
  const tools = getRelated(currentId, section);
  if (!tools.length) return null;

  const sectionLabel = section === "utilities" ? "Utilities" : "Developer Tools";

  return (
    <aside className={styles.wrap} aria-label={`More ${sectionLabel}`}>
      <p className={styles.label}>More {sectionLabel}</p>
      <ul className={styles.list} role="list">
        {tools.map((t) => (
          <li key={t.id}>
            <Link to={t.to} className={styles.item}>
              <span className={styles.itemTitle}>{t.title}</span>
              <svg
                className={styles.arrow}
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default RelatedTools;
