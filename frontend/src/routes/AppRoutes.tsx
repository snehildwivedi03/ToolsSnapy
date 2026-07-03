import { lazy, Suspense, type ComponentType } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout/MainLayout";

/* ── Lazy page imports ─────────────────────────────────────────────
   Each route’s JS is only downloaded when the user navigates to it.
   Heavy vendor libs (pdf-lib, pdfjs, tesseract, mathjs, @imgly,
   fflate …) land in their own cache-stable chunk (see vite.config.ts). */

const Home        = lazy(() => import("../pages/Home/Home"));
const Text        = lazy(() => import("../pages/Text/Text"));
const Images      = lazy(() => import("../pages/Images/Images"));
const Pdf         = lazy(() => import("../pages/Pdf/Pdf"));
const Calculators = lazy(() => import("../pages/Calculators/Calculators"));
const Utilities   = lazy(() => import("../pages/Utilities/Utilities"));
const SharePage   = lazy(() => import("../pages/Share/Share"));

const WordCounter      = lazy(() => import("../pages/Text/tools/WordCounter"));
const CharacterCounter = lazy(() => import("../pages/Text/tools/CharacterCounter"));
const CaseConverter    = lazy(() => import("../pages/Text/tools/CaseConverter"));
const JsonFormatter    = lazy(() => import("../pages/Text/tools/JsonFormatter"));
const JsonValidator    = lazy(() => import("../pages/Text/tools/JsonValidator"));
const RandomParagraph  = lazy(() => import("../pages/Text/tools/RandomParagraph"));

const ImageResize           = lazy(() => import("../pages/Images/tools/ImageResize"));
const ImageResizeDimensions = lazy(() => import("../pages/Images/tools/ImageResizeDimensions"));
const BackgroundRemove      = lazy(() => import("../pages/Images/tools/BackgroundRemove"));
const ImageConverter        = lazy(() => import("../pages/Images/tools/ImageConverter"));
const ImageToText           = lazy(() => import("../pages/Images/tools/ImageToText"));

const MergePdf    = lazy(() => import("../pages/Pdf/tools/MergePdf"));
const SplitPdf    = lazy(() => import("../pages/Pdf/tools/SplitPdf"));
const ImagesToPdf = lazy(() => import("../pages/Pdf/tools/ImagesToPdf"));
const PdfToImages = lazy(() => import("../pages/Pdf/tools/PdfToImages"));
const PdfResize   = lazy(() => import("../pages/Pdf/tools/PdfResize"));

const ScientificCalculator = lazy(() => import("../pages/Calculators/tools/ScientificCalculator"));
const BmiCalculator        = lazy(() => import("../pages/Calculators/tools/BmiCalculator"));
const EmiCalculator        = lazy(() => import("../pages/Calculators/tools/EmiCalculator"));
const SipCalculator        = lazy(() => import("../pages/Calculators/tools/SipCalculator"));
const CalorieCalculator    = lazy(() => import("../pages/Calculators/tools/CalorieCalculator"));
const PercentageCalculator = lazy(() => import("../pages/Calculators/tools/PercentageCalculator"));
const AgeCalculator        = lazy(() => import("../pages/Calculators/tools/AgeCalculator"));
const TipCalculator        = lazy(() => import("../pages/Calculators/tools/TipCalculator"));
const DiscountCalculator   = lazy(() => import("../pages/Calculators/tools/DiscountCalculator"));

const LiveClock         = lazy(() => import("../pages/Utilities/LiveClock"));
const UnitConverter     = lazy(() => import("../pages/Utilities/tools/UnitConverter"));
const PasswordGenerator = lazy(() => import("../pages/Utilities/tools/PasswordGenerator"));
const UuidGenerator     = lazy(() => import("../pages/Utilities/tools/UuidGenerator"));
const ColorPicker       = lazy(() => import("../pages/Utilities/tools/ColorPicker"));
const QrGenerator       = lazy(() => import("../pages/Utilities/tools/QrGenerator"));
const BarcodeGenerator  = lazy(() => import("../pages/Utilities/tools/BarcodeGenerator"));
const JwtDecoder        = lazy(() => import("../pages/Utilities/tools/JwtDecoder"));
const Base64Tool        = lazy(() => import("../pages/Utilities/tools/Base64Tool"));
const Sha256            = lazy(() => import("../pages/Utilities/tools/Sha256"));
const UrlEncoderDecoder = lazy(() => import("../pages/Utilities/tools/UrlEncoderDecoder"));
const UnixTimestamp     = lazy(() => import("../pages/Utilities/tools/UnixTimestamp"));
const ZipTool           = lazy(() => import("../pages/Utilities/tools/ZipTool"));
const MarkdownViewer    = lazy(() => import("../pages/Utilities/tools/MarkdownViewer"));

const ShareText      = lazy(() => import("../pages/Share/tools/ShareText"));
const ShareFiles     = lazy(() => import("../pages/Share/tools/ShareFiles"));
const ShareImages    = lazy(() => import("../pages/Share/tools/ShareImages"));
const SharePdfs      = lazy(() => import("../pages/Share/tools/SharePdfs"));
const ReceiveContent = lazy(() => import("../pages/Share/tools/ReceiveContent"));

const PrivacyPolicy  = lazy(() => import("../pages/Legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/Legal/TermsOfService"));

/* ── Spinner shown in the content area while a chunk loads ───
   MainLayout (navbar + footer) stays mounted the whole time.      */
const PageLoader = () => (
  <div style={{
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "60vh", padding: "3rem",
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: "50%",
      border: "3px solid #E3D5C5", borderTopColor: "#6F4E37",
      animation: "page-spin 0.65s linear infinite",
    }} />
    <style>{`@keyframes page-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* Each route wraps its lazy component in its own Suspense boundary */
const L = ({ C }: { C: ComponentType<object> }) => (
  <Suspense fallback={<PageLoader />}><C /></Suspense>
);

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<L C={Home} />} />

      {/* Text Tools */}
      <Route path="/text"                    element={<L C={Text} />} />
      <Route path="/text/word-counter"       element={<L C={WordCounter} />} />
      <Route path="/text/character-counter"  element={<L C={CharacterCounter} />} />
      <Route path="/text/case-converter"     element={<L C={CaseConverter} />} />
      <Route path="/text/json-formatter"     element={<L C={JsonFormatter} />} />
      <Route path="/text/json-validator"     element={<L C={JsonValidator} />} />
      <Route path="/text/random-paragraph"   element={<L C={RandomParagraph} />} />

      {/* Calculator routes */}
      <Route path="/calculators"             element={<L C={Calculators} />} />
      <Route path="/calculators/scientific"  element={<L C={ScientificCalculator} />} />
      <Route path="/calculators/bmi"         element={<L C={BmiCalculator} />} />
      <Route path="/calculators/emi"         element={<L C={EmiCalculator} />} />
      <Route path="/calculators/sip"         element={<L C={SipCalculator} />} />
      <Route path="/calculators/calories"    element={<L C={CalorieCalculator} />} />
      <Route path="/calculators/percentage"  element={<L C={PercentageCalculator} />} />
      <Route path="/calculators/age"         element={<L C={AgeCalculator} />} />
      <Route path="/calculators/tip"         element={<L C={TipCalculator} />} />
      <Route path="/calculators/discount"    element={<L C={DiscountCalculator} />} />

      {/* Legacy converter routes — served by Unit Converter */}
      <Route path="/calculators/height"      element={<L C={UnitConverter} />} />
      <Route path="/calculators/weight"      element={<L C={UnitConverter} />} />
      <Route path="/calculators/temperature" element={<L C={UnitConverter} />} />

      {/* Utilities & Dev Tools */}
      <Route path="/utilities"                    element={<L C={Utilities} />} />
      <Route path="/utilities/live-clock"         element={<L C={LiveClock} />} />
      <Route path="/utilities/unit-converter"     element={<L C={UnitConverter} />} />
      <Route path="/utilities/password-generator" element={<L C={PasswordGenerator} />} />
      <Route path="/utilities/uuid-generator"     element={<L C={UuidGenerator} />} />
      <Route path="/utilities/color-picker"       element={<L C={ColorPicker} />} />
      <Route path="/utilities/qr-generator"       element={<L C={QrGenerator} />} />
      <Route path="/utilities/barcode-generator"  element={<L C={BarcodeGenerator} />} />
      <Route path="/utilities/jwt-decoder"        element={<L C={JwtDecoder} />} />
      <Route path="/utilities/base64-encoder"     element={<L C={Base64Tool} />} />
      <Route path="/utilities/base64-decoder"     element={<L C={Base64Tool} />} />
      <Route path="/utilities/sha256"             element={<L C={Sha256} />} />
      <Route path="/utilities/url-encoder"        element={<L C={UrlEncoderDecoder} />} />
      <Route path="/utilities/unix-timestamp"     element={<L C={UnixTimestamp} />} />
      <Route path="/utilities/zip-tool"           element={<L C={ZipTool} />} />
      <Route path="/utilities/markdown-viewer"    element={<L C={MarkdownViewer} />} />
      <Route path="/developer"                    element={<L C={Utilities} />} />

      {/* Instant Share */}
      <Route path="/share"         element={<L C={SharePage} />} />
      <Route path="/share/text"    element={<L C={ShareText} />} />
      <Route path="/share/files"   element={<L C={ShareFiles} />} />
      <Route path="/share/images"  element={<L C={ShareImages} />} />
      <Route path="/share/pdfs"    element={<L C={SharePdfs} />} />
      <Route path="/share/receive" element={<L C={ReceiveContent} />} />

      {/* Image Tools */}
      <Route path="/images"                    element={<L C={Images} />} />
      <Route path="/images/resize"             element={<L C={ImageResize} />} />
      <Route path="/images/resizer"            element={<L C={ImageResizeDimensions} />} />
      <Route path="/images/background-remover" element={<L C={BackgroundRemove} />} />
      <Route path="/images/converter"          element={<L C={ImageConverter} />} />
      <Route path="/images/text-extractor"     element={<L C={ImageToText} />} />

      {/* PDF Tools */}
      <Route path="/pdf"                element={<L C={Pdf} />} />
      <Route path="/pdf/merge"          element={<L C={MergePdf} />} />
      <Route path="/pdf/split"          element={<L C={SplitPdf} />} />
      <Route path="/pdf/images-to-pdf"  element={<L C={ImagesToPdf} />} />
      <Route path="/pdf/pdf-to-images"  element={<L C={PdfToImages} />} />
      <Route path="/pdf/resize"         element={<L C={PdfResize} />} />

      {/* Legal */}
      <Route path="/privacy-policy" element={<L C={PrivacyPolicy} />} />
      <Route path="/terms"           element={<L C={TermsOfService} />} />
    </Route>
  </Routes>
);

export default AppRoutes;