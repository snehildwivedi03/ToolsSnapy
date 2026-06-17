import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
}

// SEO page titles and descriptions for each route
const SEO_DATA: Record<string, { title: string; description: string }> = {
  "/": {
    title: "ToolSnapy - Free Online Tools | PDF, Image, Text & Calculator Tools",
    description: "Free online tools that run in your browser. PDF merger, image compressor, background remover, text tools, calculators & more. 100% private.",
  },
  "/images": {
    title: "Free Image Tools - Resize, Compress, Convert Images | ToolSnapy",
    description: "Free online image tools. Resize images, remove backgrounds, convert formats, extract text (OCR). All processing happens in your browser.",
  },
  "/images/resize": {
    title: "Compress Image to Target Size - Free Online Tool | ToolSnapy",
    description: "Compress any image to an exact file size like 200KB. Free, fast, and private - runs entirely in your browser.",
  },
  "/images/resizer": {
    title: "Resize Image to Exact Dimensions - Free Online Tool | ToolSnapy",
    description: "Resize images to exact pixel dimensions with aspect ratio lock. Free image resizer that works in your browser.",
  },
  "/images/background-remover": {
    title: "Free Background Remover - AI-Powered | ToolSnapy",
    description: "Remove image backgrounds instantly with AI. Free, no signup required. Your images never leave your device.",
  },
  "/images/converter": {
    title: "Image Converter - PNG, JPG, WebP, AVIF | ToolSnapy",
    description: "Convert images between PNG, JPG, WebP, AVIF and SVG. Free online image format converter.",
  },
  "/images/text-extractor": {
    title: "Image to Text OCR - Extract Text from Images | ToolSnapy",
    description: "Extract text from images using OCR. Supports 12 languages. Free and private - works offline.",
  },
  "/pdf": {
    title: "Free PDF Tools - Merge, Split, Convert | ToolSnapy",
    description: "Free online PDF tools. Merge PDFs, split pages, convert to images. All processing in your browser - no upload needed.",
  },
  "/pdf/merge": {
    title: "Merge PDF Files Free - Combine PDFs Online | ToolSnapy",
    description: "Combine multiple PDF files into one document. Free PDF merger that works in your browser. No file upload to servers.",
  },
  "/pdf/split": {
    title: "Split PDF - Extract Pages Free | ToolSnapy",
    description: "Split PDF files and extract specific pages. Free online PDF splitter. Your files stay private.",
  },
  "/pdf/images-to-pdf": {
    title: "Convert Images to PDF Free | ToolSnapy",
    description: "Convert JPG, PNG, or WebP images to PDF. Free image to PDF converter online.",
  },
  "/pdf/pdf-to-images": {
    title: "PDF to Images - Convert PDF Pages to JPG/PNG | ToolSnapy",
    description: "Convert PDF pages to high-quality JPG or PNG images. Free PDF to image converter.",
  },
  "/text": {
    title: "Free Text Tools - Word Counter, Case Converter | ToolSnapy",
    description: "Free online text tools. Word counter, character counter, case converter, JSON formatter and more.",
  },
  "/text/word-counter": {
    title: "Word Counter - Count Words, Sentences, Paragraphs | ToolSnapy",
    description: "Free online word counter. Count words, sentences, paragraphs, and reading time instantly.",
  },
  "/text/case-converter": {
    title: "Text Case Converter - Uppercase, Lowercase, Title Case | ToolSnapy",
    description: "Convert text to uppercase, lowercase, title case, camelCase, snake_case and more. Free online tool.",
  },
  "/text/json-formatter": {
    title: "JSON Formatter & Beautifier - Free Online Tool | ToolSnapy",
    description: "Format and beautify JSON online. Free JSON formatter with syntax highlighting.",
  },
  "/calculators": {
    title: "Free Online Calculators - BMI, EMI, SIP & More | ToolSnapy",
    description: "Free online calculators. Scientific calculator, BMI calculator, EMI calculator, SIP calculator and more.",
  },
  "/calculators/scientific": {
    title: "Scientific Calculator Online - Free | ToolSnapy",
    description: "Free online scientific calculator with trigonometry, logarithms, and advanced functions.",
  },
  "/calculators/bmi": {
    title: "BMI Calculator - Calculate Body Mass Index | ToolSnapy",
    description: "Calculate your BMI (Body Mass Index) free. Get instant health assessment with our online BMI calculator.",
  },
  "/utilities": {
    title: "Free Developer Tools - QR, Password, UUID Generator | ToolSnapy",
    description: "Free developer utilities. QR code generator, password generator, UUID generator, color picker and more.",
  },
  "/utilities/qr-generator": {
    title: "QR Code Generator - Create QR Codes Free | ToolSnapy",
    description: "Generate QR codes for URLs, text, or contact info. Free QR code maker online.",
  },
  "/utilities/password-generator": {
    title: "Password Generator - Create Strong Passwords | ToolSnapy",
    description: "Generate secure random passwords. Free online password generator with customizable options.",
  },
  "/share": {
    title: "Instant Share - Share Files, Text & Images | ToolSnapy",
    description: "Share files, text, and images instantly with a 6-character code. Auto-deletes after 15 minutes.",
  },
};

/**
 * SEO component that updates document title and meta description
 * based on current route. Use in any page component.
 */
export function useSEO(props?: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const data = SEO_DATA[location.pathname];
    const title = props?.title || data?.title || "ToolSnapy - Free Online Tools";
    const description = props?.description || data?.description || 
      "Free online tools that run in your browser. PDF, image, text tools and calculators. 100% private.";

    // Update title
    document.title = title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", `https://toolsnapy.com${location.pathname}`);
    }

    // Update OG URL
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", `https://toolsnapy.com${location.pathname}`);
    }
  }, [location.pathname, props?.title, props?.description]);
}

export default useSEO;
