import type { HealthApi } from "../../contract/health.js";
import { DATA_DIR, PORT } from "../../env.js";

export const healthService: HealthApi = {
  async get() {
    return { status: "up", port: PORT, dataDir: DATA_DIR };
  },
};
