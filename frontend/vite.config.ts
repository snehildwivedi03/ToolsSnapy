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
    },
    allowedHosts: ["plots-knight-lady-duration.trycloudflare.com"],
  },
});
