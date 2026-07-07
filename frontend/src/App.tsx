import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import ConsentBanner from "./components/ConsentBanner/ConsentBanner";
import { useSEO } from "./hooks/useSEO";
import { preloadBgModel } from "./utils/preloadBgModel";
import "./index.css";

// SEO wrapper component
const SEOWrapper = () => {
  useSEO();
  return null;
};

// Root shell - BrowserRouter must wrap all route-aware components
const App = () => {
  // Warm the background-remover AI model cache in the background as soon as the
  // site loads, on any page, so the tool is instant if/when the user opens it.
  useEffect(() => {
    preloadBgModel();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <SEOWrapper />
      <AppRoutes />
      <ConsentBanner />
    </BrowserRouter>
  );
};

export default App;
