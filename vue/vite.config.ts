import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../docs",
    rollupOptions: {
      output: {
        entryFileNames: "photography.js",
      },
    },
  },
  server: {
    proxy: {
      // This avoids CORS issues with the Vite dev server
      "/r2-proxy": {
        target: "https://images.alexandergillon.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/r2-proxy/, ""),
      },
    },
  },
});
