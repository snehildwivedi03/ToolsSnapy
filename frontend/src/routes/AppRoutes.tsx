import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Home from "../pages/Home/Home";

// Lazy-loaded page placeholders — swap in real pages as they're built
const Placeholder = ({ label }: { label: string }) => (
  <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
    <h1>{label}</h1>
  </main>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pdf" element={<Placeholder label="PDF Tools" />} />
        <Route path="/images" element={<Placeholder label="Image Tools" />} />
        <Route path="/text" element={<Placeholder label="Text Tools" />} />
        <Route
          path="/calculators"
          element={<Placeholder label="Calculators" />}
        />
        <Route path="/utilities" element={<Placeholder label="Utilities" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
