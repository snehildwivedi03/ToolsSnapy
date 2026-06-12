import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Home from "../pages/Home/Home";
import Text from "../pages/Text/Text";
import WordCounter from "../pages/Text/tools/WordCounter";
import CharacterCounter from "../pages/Text/tools/CharacterCounter";
import CaseConverter from "../pages/Text/tools/CaseConverter";
import JsonFormatter from "../pages/Text/tools/JsonFormatter";
import JsonValidator from "../pages/Text/tools/JsonValidator";
import RandomParagraph from "../pages/Text/tools/RandomParagraph";
import Calculators from "../pages/Calculators/Calculators";
import ScientificCalculator from "../pages/Calculators/tools/ScientificCalculator";
import BmiCalculator from "../pages/Calculators/tools/BmiCalculator";
import EmiCalculator from "../pages/Calculators/tools/EmiCalculator";
import SipCalculator from "../pages/Calculators/tools/SipCalculator";
import CalorieCalculator from "../pages/Calculators/tools/CalorieCalculator";
import HeightConverter from "../pages/Calculators/tools/HeightConverter";
import WeightConverter from "../pages/Calculators/tools/WeightConverter";
import PercentageCalculator from "../pages/Calculators/tools/PercentageCalculator";
import AgeCalculator from "../pages/Calculators/tools/AgeCalculator";
import TipCalculator from "../pages/Calculators/tools/TipCalculator";
import TemperatureConverter from "../pages/Calculators/tools/TemperatureConverter";
import DiscountCalculator from "../pages/Calculators/tools/DiscountCalculator";

// Placeholder for modules not yet implemented
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

        {/* Text Tools */}
        <Route path="/text" element={<Text />} />
        <Route path="/text/word-counter" element={<WordCounter />} />
        <Route
          path="/text/character-counter"
          element={<CharacterCounter />}
        />
        <Route
          path="/text/case-converter"
          element={<CaseConverter />}
        />
        <Route
          path="/text/json-formatter"
          element={<JsonFormatter />}
        />
        <Route
          path="/text/json-validator"
          element={<JsonValidator />}
        />
        <Route
          path="/text/random-paragraph"
          element={<RandomParagraph />}
        />

        {/* Calculator routes */}
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/calculators/scientific"  element={<ScientificCalculator />} />
        <Route path="/calculators/bmi"         element={<BmiCalculator />} />
        <Route path="/calculators/emi"         element={<EmiCalculator />} />
        <Route path="/calculators/sip"         element={<SipCalculator />} />
        <Route path="/calculators/calories"    element={<CalorieCalculator />} />
        <Route path="/calculators/height"      element={<HeightConverter />} />
        <Route path="/calculators/weight"      element={<WeightConverter />} />
        <Route path="/calculators/percentage"  element={<PercentageCalculator />} />
        <Route path="/calculators/age"         element={<AgeCalculator />} />
        <Route path="/calculators/tip"         element={<TipCalculator />} />
        <Route path="/calculators/temperature" element={<TemperatureConverter />} />
        <Route path="/calculators/discount"    element={<DiscountCalculator />} />

        {/* Placeholders   swap in real pages as modules are built */}
        <Route path="/pdf" element={<Placeholder label="PDF Tools" />} />
        <Route
          path="/images"
          element={<Placeholder label="Image Tools" />}
        />
        <Route
          path="/utilities"
          element={<Placeholder label="Utilities" />}
        />
        <Route
          path="/developer"
          element={<Placeholder label="Developer Tools" />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;