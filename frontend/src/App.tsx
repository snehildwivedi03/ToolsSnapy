import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { useSEO } from "./hooks/useSEO";
import "./index.css";

// SEO wrapper component
const SEOWrapper = () => {
  useSEO();
  return null;
};

// Root shell - BrowserRouter must wrap all route-aware components
const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SEOWrapper />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
