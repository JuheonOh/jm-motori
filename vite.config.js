import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss()],
  // Use root base during local dev to avoid API referrer/auth mismatches.
  base: command === "serve" ? "/" : "/jm-motori/",
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
  esbuild: {
    jsx: "automatic",
  },
}));
