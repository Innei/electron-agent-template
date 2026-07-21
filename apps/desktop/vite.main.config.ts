import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const desktopDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: desktopDir,

  ssr: {
    // Single-graph invariant: everything JS is bundled so the whole main
    // process shares one module instance of every dep (electron-ipc-decorator
    // metadata keys on module-local Symbols — two copies would split the
    // registry). Only host-provided electron and the native better-sqlite3
    // stay external, which is exactly the set electron-builder ships in
    // node_modules (dependencies + asarUnpack).
    noExternal: true,
    external: ["better-sqlite3"],
  },
  build: {
    ssr: true,
    outDir: "dist-main",
    emptyOutDir: true,
    minify: false,
    target: "node24",
    sourcemap: false,
    rollupOptions: {
      input: { main: fileURLToPath(new URL("./src/main.ts", import.meta.url)) },
      external: [/^electron($|\/)/, /^better-sqlite3($|\/)/],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
        chunkFileNames: "[name]-[hash].mjs",
      },
    },
  },
});
