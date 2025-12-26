import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  const isProd = mode === "prod" || mode === "production";

  return {
    server: {
      port: 3000,
      strictPort: true,
    },
    plugins: [
      // declarationMap을 모드에 따라 제어하기 위해 dts 플러그인 사용
      dts({
        insertTypesEntry: true,
        compilerOptions: {
          // 배포 모드일 때는 선언 지도(Source와 .d.ts 연결)를 끔
          declarationMap: !isProd,
        },
      }),
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "TCuritySDK",
        formats: ["iife"],
        fileName: (format) => `sdk.js`,
      },
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          manualChunks: undefined,
        },
      },
      sourcemap: !isProd,
      minify: isProd ? "terser" : false,
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    publicDir: false,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
