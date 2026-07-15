import { join } from "node:path";
import { app, safeStorage } from "electron";
import { createDesktopSecretBox } from "../credentials/secretBox.js";
import { IS_DEV } from "./env.js";

export async function bootKernel() {
  const { initServerRuntime } = await import("../../../server/src/runtimeInit.js");
  const { createKernel } = await import("../../../server/src/bootstrap.js");
  const { attachRealtimeBridge } = await import("../realtime/bridge.js");
  const { DATA_DIR } = await import("../../../../packages/core/src/env.js");

  // Dev keeps the plaintext keyfile so ELECTRON_DEV workflows are
  // unaffected; packaged builds move the AI master key into safeStorage.
  const secretBox = IS_DEV
    ? undefined
    : createDesktopSecretBox({
        safeStorage,
        wrappedKeyPath: join(app.getPath("userData"), "ai-master-key.json"),
        legacyKeyPath: join(DATA_DIR, "ai-secret.key"),
      });

  initServerRuntime({ secretBox });
  const kernel = await createKernel();
  const apiApp = kernel.app.getInstance();
  attachRealtimeBridge();

  const health = await apiApp.fetch(new Request("http://localhost/api/health"));
  console.log(`[desktop] kernel self-test /api/health -> ${health.status}`, await health.text());

  return kernel;
}
