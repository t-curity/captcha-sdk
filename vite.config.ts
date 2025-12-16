import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "TCuritySDK",
      formats: ["iife"],
      fileName: () => "sdk.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    minify: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
