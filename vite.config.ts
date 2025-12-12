import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "TCuritySDK",
      fileName: () => "sdk.js",
      formats: ["umd"],
    },
    minify: "terser",
    outDir: "dist",
    emptyOutDir: true,
  },
});
