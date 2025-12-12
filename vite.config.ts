import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "TCuritySDK",
      fileName: () => "captcha.js",
      formats: ["umd"],
    },
    minify: "terser",
    outDir: "dist",
    emptyOutDir: true,
  },
});
