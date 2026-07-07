import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api/* to the Express backend during development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Forward /r/* (short-link redirects) to the backend
      "/r": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    allowedHosts: ["plots-knight-lady-duration.trycloudflare.com"],
  },
  build: {
    // Target modern browsers — smaller, faster output
    target: "es2020",
    // Split CSS per chunk so unused styles aren't loaded
    cssCodeSplit: true,
    // Raise the warning threshold slightly (some vendor libs are large by design)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Give each chunk a stable, cache-friendly name
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        // Split heavy vendor libraries into separate chunks.
        // Each chunk is independently cached by the browser, so a code
        // change to your app doesn't bust the cached pdf-lib or tesseract chunk.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Heavy AI / WASM — keep isolated so other pages don't pay the cost
          if (id.includes("@imgly/background-removal")) return "vendor-bgr";
          if (id.includes("tesseract"))                 return "vendor-ocr";
          // PDF processing
          if (id.includes("pdfjs-dist") || id.includes("pdf-lib")) return "vendor-pdf";
          // Math engine
          if (id.includes("mathjs"))                    return "vendor-math";
          // Compression / archiving
          if (id.includes("fflate"))                    return "vendor-zip";
          // Markdown + sanitizer
          if (id.includes("marked") || id.includes("dompurify")) return "vendor-md";
          // QR / barcode rendering
          if (id.includes("qrcode") || id.includes("react-barcode")) return "vendor-qr";
          // React core — changes rarely, long cache lifetime
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("react-redux") ||
            id.includes("@reduxjs")
          ) return "vendor-react";
          // Everything else (axios, mathjs helpers, etc.)
          return "vendor-misc";
        },
      },
    },
  },
});
