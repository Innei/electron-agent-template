import { afterEach, describe, expect, it, vi } from "vitest";
import { allRoutes } from "../../../../packages/core/src/contract/index.js";
import { ApiError } from "../api";
import { createHttpClient } from "./http";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("createHttpClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("substitutes path params and drops them from the query", async () => {
    const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse({ ok: true, data: { note: { id: "abc" } } }));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    await client.notes.get({ id: "abc" });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/notes/abc");
  });

  it("sends a JSON body for POST/PATCH/PUT with the remaining fields", async () => {
    const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) =>
      jsonResponse({ ok: true, data: { note: { id: "x" } } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    await client.notes.create({ title: "hello", body: "world" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/notes");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({ title: "hello", body: "world" });
  });

  it("substitutes path params for PATCH and keeps the rest in the body", async () => {
    const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) =>
      jsonResponse({ ok: true, data: { note: { id: "abc" } } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    await client.notes.update({ id: "abc", title: "new" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/notes/abc");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(init?.body as string)).toEqual({ title: "new" });
  });

  it("does not wrap the result for plain envelope routes", async () => {
    const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse({ ok: true, data: { notes: [] } }));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    const result = await client.notes.list();
    expect(result).toEqual({ notes: [] });
  });

  it("throws ApiError on an ok:false envelope", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: false, error: "not found" }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    await expect(client.notes.get({ id: "x" })).rejects.toThrow(ApiError);
  });

  it("throws on a malformed envelope", async () => {
    const fetchMock = vi.fn(async (_url?: string, _init?: RequestInit) => jsonResponse({ not: "an envelope" }));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    await expect(client.notes.list()).rejects.toThrow(ApiError);
  });

  it("throws on invalid JSON", async () => {
    const fetchMock = vi.fn(async () => new Response("not json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    await expect(client.notes.list()).rejects.toThrow(ApiError);
  });

  it('returns the JSON body as-is for raw:"body" routes, with no envelope unwrap', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ session: null, messages: [], busy: false, partial: null }));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    const result = await client.assistant.getChat({ id: "abc" });
    expect(result).toEqual({ session: null, messages: [], busy: false, partial: null });
  });

  it('returns { status, body } for raw:"statusBody" routes on success', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ accepted: true }, 202));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    const result = await client.assistant.postMessage({ id: "abc", text: "hi" });
    expect(result).toEqual({ status: 202, body: { accepted: true } });
  });

  it('returns { status, body } without throwing for raw:"statusBody" routes on non-2xx', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ error: "busy" }, 409));
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpClient(allRoutes);

    const result = await client.assistant.postMessage({ id: "abc", text: "hi" });
    expect(result).toEqual({ status: 409, body: { error: "busy" } });
  });
});
