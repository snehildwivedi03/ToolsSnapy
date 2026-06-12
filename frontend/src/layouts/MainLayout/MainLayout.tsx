import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./MainLayout.module.css";

// Wraps every page with the shared chrome: nav, content, footer
const MainLayout = () => {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.content}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
