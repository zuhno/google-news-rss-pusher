import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    !!process.env.HTTPS &&
      mkcert({
        autoUpgrade: true,
        mkcertPath: "/opt/homebrew/bin/mkcert",
        savePath: process.cwd(),
        source: "coding",
      }),
  ],
  build: {
    target: "esnext",
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.indexOf("node_modules") !== -1) {
            const module = id.split("node_modules/").pop()?.split("/")[0];
            return `vendor-${module}`;
          }
        },
      },
    },
  },
  server: {
    https: !!process.env.HTTPS,
    port: 3000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
