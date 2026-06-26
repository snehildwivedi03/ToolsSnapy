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
import Images from "../pages/Images/Images";
import ImageResize from "../pages/Images/tools/ImageResize";
import ImageResizeDimensions from "../pages/Images/tools/ImageResizeDimensions";
import BackgroundRemove from "../pages/Images/tools/BackgroundRemove";
import ImageConverter from "../pages/Images/tools/ImageConverter";
import ImageToText from "../pages/Images/tools/ImageToText";
import Pdf from "../pages/Pdf/Pdf";
import MergePdf from "../pages/Pdf/tools/MergePdf";
import SplitPdf from "../pages/Pdf/tools/SplitPdf";
import ImagesToPdf from "../pages/Pdf/tools/ImagesToPdf";
import PdfToImages from "../pages/Pdf/tools/PdfToImages";
import PdfResize from "../pages/Pdf/tools/PdfResize";
import Calculators from "../pages/Calculators/Calculators";
import ScientificCalculator from "../pages/Calculators/tools/ScientificCalculator";
import BmiCalculator from "../pages/Calculators/tools/BmiCalculator";
import EmiCalculator from "../pages/Calculators/tools/EmiCalculator";
import SipCalculator from "../pages/Calculators/tools/SipCalculator";
import CalorieCalculator from "../pages/Calculators/tools/CalorieCalculator";
import PercentageCalculator from "../pages/Calculators/tools/PercentageCalculator";
import AgeCalculator from "../pages/Calculators/tools/AgeCalculator";
import TipCalculator from "../pages/Calculators/tools/TipCalculator";
import DiscountCalculator from "../pages/Calculators/tools/DiscountCalculator";
import Utilities from "../pages/Utilities/Utilities";
import LiveClock from "../pages/Utilities/LiveClock";
import UnitConverter from "../pages/Utilities/tools/UnitConverter";
import PasswordGenerator from "../pages/Utilities/tools/PasswordGenerator";
import UuidGenerator from "../pages/Utilities/tools/UuidGenerator";
import ColorPicker from "../pages/Utilities/tools/ColorPicker";
import QrGenerator from "../pages/Utilities/tools/QrGenerator";
import BarcodeGenerator from "../pages/Utilities/tools/BarcodeGenerator";
import JwtDecoder from "../pages/Utilities/tools/JwtDecoder";
import Base64Tool from "../pages/Utilities/tools/Base64Tool";
import Sha256 from "../pages/Utilities/tools/Sha256";
import UrlEncoderDecoder from "../pages/Utilities/tools/UrlEncoderDecoder";
import UnixTimestamp from "../pages/Utilities/tools/UnixTimestamp";
import SharePage from "../pages/Share/Share";
import ShareText from "../pages/Share/tools/ShareText";
import ShareFiles from "../pages/Share/tools/ShareFiles";
import ShareImages from "../pages/Share/tools/ShareImages";
import SharePdfs from "../pages/Share/tools/SharePdfs";
import ReceiveContent from "../pages/Share/tools/ReceiveContent";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        {/* Text Tools */}
        <Route path="/text" element={<Text />} />
        <Route path="/text/word-counter" element={<WordCounter />} />
        <Route path="/text/character-counter" element={<CharacterCounter />} />
        <Route path="/text/case-converter" element={<CaseConverter />} />
        <Route path="/text/json-formatter" element={<JsonFormatter />} />
        <Route path="/text/json-validator" element={<JsonValidator />} />
        <Route path="/text/random-paragraph" element={<RandomParagraph />} />

        {/* Calculator routes (9 tools — converters moved to Unit Converter) */}
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/calculators/scientific"  element={<ScientificCalculator />} />
        <Route path="/calculators/bmi"         element={<BmiCalculator />} />
        <Route path="/calculators/emi"         element={<EmiCalculator />} />
        <Route path="/calculators/sip"         element={<SipCalculator />} />
        <Route path="/calculators/calories"    element={<CalorieCalculator />} />
        <Route path="/calculators/percentage"  element={<PercentageCalculator />} />
        <Route path="/calculators/age"         element={<AgeCalculator />} />
        <Route path="/calculators/tip"         element={<TipCalculator />} />
        <Route path="/calculators/discount"    element={<DiscountCalculator />} />

        {/* Legacy converter routes — redirect to Unit Converter */}
        <Route path="/calculators/height"      element={<UnitConverter />} />
        <Route path="/calculators/weight"      element={<UnitConverter />} />
        <Route path="/calculators/temperature" element={<UnitConverter />} />

        {/* Utilities & Dev Tools */}
        <Route path="/utilities"                    element={<Utilities />} />
        <Route path="/utilities/live-clock"         element={<LiveClock />} />
        <Route path="/utilities/unit-converter"     element={<UnitConverter />} />
        <Route path="/utilities/password-generator" element={<PasswordGenerator />} />
        <Route path="/utilities/uuid-generator"     element={<UuidGenerator />} />
        <Route path="/utilities/color-picker"       element={<ColorPicker />} />
        <Route path="/utilities/qr-generator"       element={<QrGenerator />} />
        <Route path="/utilities/barcode-generator"  element={<BarcodeGenerator />} />
        <Route path="/utilities/jwt-decoder"        element={<JwtDecoder />} />
        <Route path="/utilities/base64-encoder"     element={<Base64Tool />} />
        <Route path="/utilities/base64-decoder"     element={<Base64Tool />} />
        <Route path="/utilities/sha256"             element={<Sha256 />} />
        <Route path="/utilities/url-encoder"        element={<UrlEncoderDecoder />} />
        <Route path="/utilities/unix-timestamp"     element={<UnixTimestamp />} />

        {/* Legacy /developer route — redirect to unified page */}
        <Route path="/developer" element={<Utilities />} />

        {/* Instant Share */}
        <Route path="/share"         element={<SharePage />} />
        <Route path="/share/text"    element={<ShareText />} />
        <Route path="/share/files"   element={<ShareFiles />} />
        <Route path="/share/images"  element={<ShareImages />} />
        <Route path="/share/pdfs"    element={<SharePdfs />} />
        <Route path="/share/receive" element={<ReceiveContent />} />

        {/* Image Tools */}
        <Route path="/images"                    element={<Images />} />
        <Route path="/images/resize"             element={<ImageResize />} />
        <Route path="/images/resizer"            element={<ImageResizeDimensions />} />
        <Route path="/images/background-remover" element={<BackgroundRemove />} />
        <Route path="/images/converter"          element={<ImageConverter />} />
        <Route path="/images/text-extractor"     element={<ImageToText />} />

        {/* PDF Tools */}
        <Route path="/pdf"                element={<Pdf />} />
        <Route path="/pdf/merge"          element={<MergePdf />} />
        <Route path="/pdf/split"          element={<SplitPdf />} />
        <Route path="/pdf/images-to-pdf"  element={<ImagesToPdf />} />
        <Route path="/pdf/pdf-to-images"  element={<PdfToImages />} />
        <Route path="/pdf/resize"          element={<PdfResize />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;