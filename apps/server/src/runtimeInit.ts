import type { SecretBox } from "../../../packages/core/src/ai/secretBox.js";
import { initAiSettings } from "../../../packages/core/src/ai/initAiSettings.js";
import { getDb } from "../../../packages/core/src/db/index.js";
import { loadDotenv } from "./dotenv.js";

export interface ServerRuntimeOptions {
  secretBox?: SecretBox;
}

export function initServerRuntime(opts?: ServerRuntimeOptions): void {
  loadDotenv();

  // 1h prompt-cache TTL: keeps repeated agent turns inside the provider cache window.
  process.env.PI_CACHE_RETENTION ??= "long";

  initAiSettings(getDb(), { secretBox: opts?.secretBox });
}
