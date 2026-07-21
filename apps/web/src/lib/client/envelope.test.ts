import { describe, expect, it } from "vitest";
import { ApiError } from "../api";
import { unwrapEnvelope } from "./envelope";

describe("unwrapEnvelope", () => {
  it("returns data and meta for an ok envelope", () => {
    expect(unwrapEnvelope({ ok: true, data: { a: 1 }, meta: { b: 2 } }, 200)).toEqual({
      data: { a: 1 },
      meta: { b: 2 },
    });
  });

  it("returns data with undefined meta when the envelope has none", () => {
    expect(unwrapEnvelope({ ok: true, data: [1, 2] }, 200)).toEqual({ data: [1, 2], meta: undefined });
  });

  it("throws ApiError with the hint appended", () => {
    try {
      unwrapEnvelope({ ok: false, error: "boom", hint: "try again" }, 400);
      throw new Error("expected unwrapEnvelope to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toBe("boom (try again)");
      expect((err as ApiError).status).toBe(400);
    }
  });
});
