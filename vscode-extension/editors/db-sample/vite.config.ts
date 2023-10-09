import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome89", "edge89", "firefox89", "safari15.1"],
    outDir: "../../out",
    rollupOptions: {
      output: {
        entryFileNames: `editors/db-sample/[name].js`,
        chunkFileNames: `editors/db-sample/[name].js`,
        assetFileNames: (assetInfo) => {
          const fileExtension = assetInfo.name.split(".").at(1);
          if (fileExtension === "wasm") {
            return `wasm/[name].[ext]`;
          }
          return `editors/db-sample/[name].[ext]`;
        },
      },
    },
  },
  plugins: [svelte()],
  resolve: {
    alias: {
      crypto: "node:crypto",
    },
  },
});
