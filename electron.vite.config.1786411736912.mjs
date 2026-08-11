// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { extensions: [".ts", ".tsx", ".mjs", ".js", ".json"] },
    build: { rollupOptions: { input: resolve("src/main/index.ts") } }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { extensions: [".ts", ".tsx", ".mjs", ".js", ".json"] },
    build: { rollupOptions: { input: resolve("src/preload/index.ts") } }
  },
  renderer: {
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};
