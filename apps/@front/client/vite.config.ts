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
