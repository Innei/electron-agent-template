import { describe, expect, it } from "vitest";
import {
  detectMentionTrigger,
  filterMentionCandidates,
  findMentionedCandidates,
  insertMention,
  removeMention,
} from "./atMention.js";

describe("detectMentionTrigger", () => {
  it("detects a trigger right after @", () => {
    expect(detectMentionTrigger("@", 1)).toEqual({ start: 0, query: "" });
  });

  it("detects a trigger with a query in progress", () => {
    const value = "hi @MU";
    expect(detectMentionTrigger(value, value.length)).toEqual({ start: 3, query: "MU" });
  });

  it("detects a trigger mid-text when cursor sits inside the query", () => {
    const value = "@docs/alpha tail";
    expect(detectMentionTrigger(value, 5)).toEqual({ start: 0, query: "docs" });
  });

  it("returns null when there is no @ before the cursor", () => {
    expect(detectMentionTrigger("hello world", 5)).toBeNull();
  });

  it("returns null when whitespace breaks the @ from the cursor", () => {
    expect(detectMentionTrigger("@MU hello", 9)).toBeNull();
  });

  it("anchors to the most recent @ when multiple appear", () => {
    expect(detectMentionTrigger("@a@b", 4)).toEqual({ start: 2, query: "b" });
  });
});

describe("filterMentionCandidates", () => {
  const candidates = [
    { path: "docs/alpha.md", title: "Alpha" },
    { path: "docs/betaX.md", title: "Beta" },
    { path: "docs/2026-07-14-note.md", title: "Daily note" },
  ];

  it("returns all candidates (capped) when the query is empty", () => {
    expect(filterMentionCandidates(candidates, "")).toEqual(candidates);
  });

  it("filters by path substring case-insensitively", () => {
    expect(filterMentionCandidates(candidates, "ALPHA")).toEqual([candidates[0]]);
  });

  it("filters by title substring", () => {
    expect(filterMentionCandidates(candidates, "beta")).toEqual([candidates[1]]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterMentionCandidates(candidates, "tsla")).toEqual([]);
  });
});

describe("insertMention", () => {
  it("replaces the trigger span with the mention path and a trailing space", () => {
    const result = insertMention("hi @MU trend", 6, { start: 3, query: "MU" }, "docs/alpha.md");
    expect(result.text).toBe("hi @docs/alpha.md  trend");
    expect(result.cursor).toBe("hi @docs/alpha.md ".length);
  });

  it("works when the trigger is at the start of an empty value", () => {
    const result = insertMention("@", 1, { start: 0, query: "" }, "docs/alpha.md");
    expect(result.text).toBe("@docs/alpha.md ");
    expect(result.cursor).toBe("@docs/alpha.md ".length);
  });

  it("regression: a stale cursor (captured before the caret moved via click/arrow keys, not onChange) corrupts the slice", () => {
    const value = "@MU then typed a lot more";
    const trigger = detectMentionTrigger(value, 3);
    expect(trigger).toEqual({ start: 0, query: "MU" });

    const liveCursor = 3;
    const staleCursor = 2;

    const withLiveCursor = insertMention(value, liveCursor, trigger!, "docs/alpha.md");
    const withStaleCursor = insertMention(value, staleCursor, trigger!, "docs/alpha.md");

    expect(withLiveCursor.text).toBe("@docs/alpha.md  then typed a lot more");
    expect(withStaleCursor.text).not.toBe(withLiveCursor.text);
    expect(withStaleCursor.text).toBe("@docs/alpha.md U then typed a lot more");
  });
});

describe("visible mention references", () => {
  const candidates = [
    { path: "docs/alpha.md", title: "Alpha" },
    { path: "docs/betaX.md", title: "Beta" },
  ];

  it("returns known references in library order without duplicating them", () => {
    expect(findMentionedCandidates("compare @docs/betaX.md and @docs/alpha.md, then @docs/betaX.md", candidates)).toEqual([
      candidates[0],
      candidates[1],
    ]);
  });

  it("ignores free-form @ text that is not a known research path", () => {
    expect(findMentionedCandidates("tell @someone about @docs/alpha.md", candidates)).toEqual([candidates[0]]);
  });

  it("removes a selected reference without damaging the surrounding prompt", () => {
    expect(removeMention("compare @docs/betaX.md and @docs/alpha.md", "docs/betaX.md")).toBe("compare and @docs/alpha.md");
    expect(removeMention("@docs/alpha.md check supply", "docs/alpha.md")).toBe("check supply");
  });
});
