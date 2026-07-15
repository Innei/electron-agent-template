import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import "reflect-metadata";

process.env.APP_DATA_DIR ??= mkdtempSync(join(tmpdir(), "server-test-data-"));
