import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5175 },
  css: {
    // Inline PostCSS config — overrides any postcss.config.js in parent dirs.
    // @tailwindcss/vite handles CSS directly; no PostCSS tailwind plugin needed.
    postcss: {
      plugins: [],
    },
  },
});
