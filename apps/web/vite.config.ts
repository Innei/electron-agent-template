import babel from "@rolldown/plugin-babel";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const KERNEL_PORT = Number(process.env.KERNEL_PORT || 5200);
const KERNEL_URL = `http://localhost:${KERNEL_PORT}`;

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    port: 5199,
    proxy: {
      "/api": { target: KERNEL_URL, ws: true },
      "/legacy": { target: KERNEL_URL },
    },
  },
});
