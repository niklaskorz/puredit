import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["chrome89", "edge89", "firefox89", "safari15.1"],
  },
  plugins: [svelte()],
  resolve: {
    alias: {
      crypto: "node:crypto",
    },
  },
});
