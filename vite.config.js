import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const clientDir = fileURLToPath(new URL("./client", import.meta.url));
const distDir = fileURLToPath(new URL("./dist", import.meta.url));

export default defineConfig({
  root: clientDir,
  envDir: rootDir,
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: distDir,
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
  },
});
