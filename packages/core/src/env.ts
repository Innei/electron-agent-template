import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// Electron bundles this module into apps/desktop/dist-main/main.mjs, which moves
// "here" away from its real source location — APP_PROJECT_ROOT lets the desktop
// host pin the repo root explicitly instead of relying on it.
const rootOverride = process.env.APP_PROJECT_ROOT;

export const PROJECT_ROOT = rootOverride ?? join(here, "..", "..", "..");
export const DATA_DIR = process.env.APP_DATA_DIR ?? join(PROJECT_ROOT, "data");
export const WEB_ROOT = join(PROJECT_ROOT, "apps", "web");
export const PORT = Number(process.env.PORT || 5199);
export const KERNEL_PORT = Number(process.env.KERNEL_PORT || 5200);
export const HOST_MODE: "dev" | "prod" = process.env.HOST_MODE === "dev" ? "dev" : "prod";
export const BASE_URL = `http://localhost:${PORT}`;
export const WEB_DIST = join(WEB_ROOT, "dist");
