import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api";
import { createIpcClient } from "./ipc";

describe("createIpcClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when window.desktop.rpc is absent", () => {
    vi.stubGlobal("window", {});
    expect(createIpcClient()).toBeNull();
  });

  it("invokes '<group>.<method>' channels and unwraps a successful envelope", async () => {
    const invoke = vi.fn(async (channel: string) => {
      expect(channel).toBe("notes.list");
      return { ok: true, data: { notes: [] } };
    });
    vi.stubGlobal("window", { desktop: { rpc: { invoke } } });

    const ipcClient = createIpcClient();
    expect(ipcClient).not.toBeNull();
    const result = await ipcClient!.notes.list();

    expect(result).toEqual({ notes: [] });
    expect(invoke).toHaveBeenCalledWith("notes.list", undefined);
  });

  it("passes input through to invoke", async () => {
    const invoke = vi.fn(async () => ({ ok: true, data: { note: { id: "abc" } } }));
    vi.stubGlobal("window", { desktop: { rpc: { invoke } } });

    const ipcClient = createIpcClient()!;
    await ipcClient.notes.get({ id: "abc" });

    expect(invoke).toHaveBeenCalledWith("notes.get", { id: "abc" });
  });

  it("throws ApiError for an ok:false envelope", async () => {
    const invoke = vi.fn(async () => ({ ok: false, error: "not found", status: 404 }));
    vi.stubGlobal("window", { desktop: { rpc: { invoke } } });

    const ipcClient = createIpcClient()!;
    await expect(ipcClient.notes.get({ id: "x" })).rejects.toThrow(ApiError);
  });
});
