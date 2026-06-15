import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Порт 3000 — чтобы совпасть с CORS_ORIGIN бэкенда по умолчанию.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
});
