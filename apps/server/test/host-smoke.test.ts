import { existsSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import WebSocket from "ws";
import { DATA_DIR, PORT, WEB_DIST } from "../../../packages/core/src/env.js";

const { startHost } = await import("../src/host.js");

describe("host smoke", () => {
  let server: Server;
  let baseUrl: string;
  let wsUrl: string;

  beforeAll(async () => {
    const handle = await startHost(0, false);
    server = handle.server;
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
    wsUrl = `ws://127.0.0.1:${port}/api/ws`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("GET /api/health returns the exact envelope", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      data: { status: "up", port: PORT, dataDir: DATA_DIR },
    });
  });

  it("GET /api/notes returns the list envelope", async () => {
    const res = await fetch(`${baseUrl}/api/notes`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; data: { notes: unknown[] } };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data.notes)).toBe(true);
  });

  it("GET /api/nope hits the kernel's unmatched-route fallback", async () => {
    const res = await fetch(`${baseUrl}/api/nope`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("404 Not Found");
  });

  it("round-trips a notes WS sub over a real socket then closes cleanly", async () => {
    const client = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      client.on("open", resolve);
      client.on("error", reject);
    });

    const received: string[] = [];
    client.on("message", (data) => received.push(String(data)));
    client.send(JSON.stringify({ op: "sub", key: "n1", kind: "notes" }));

    await vi.waitFor(() => {
      if (received.length === 0) throw new Error("no message yet");
    });
    expect(JSON.parse(received[0])).toEqual({ key: "n1", payload: { type: "init" } });

    await new Promise<void>((resolve) => {
      client.on("close", () => resolve());
      client.close();
    });
  });

  it("GET / stays up (serves web dist when present, else API-only)", async () => {
    const res = await fetch(`${baseUrl}/`);
    if (existsSync(WEB_DIST)) {
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/html");
    } else {
      expect(res.status).not.toBe(500);
    }
  });
});
