import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/",
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
  esbuild: {
    jsx: "automatic",
  },
});
