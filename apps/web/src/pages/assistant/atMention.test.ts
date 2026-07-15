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
    const value = "@stocks/MU tail";
    expect(detectMentionTrigger(value, 5)).toEqual({ start: 0, query: "stoc" });
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
    { path: "stocks/MU.md", title: "Micron" },
    { path: "stocks/NVDA.md", title: "Nvidia" },
    { path: "journal/2026-07-14-flow.md", title: "Capital flow" },
  ];

  it("returns all candidates (capped) when the query is empty", () => {
    expect(filterMentionCandidates(candidates, "")).toEqual(candidates);
  });

  it("filters by path substring case-insensitively", () => {
    expect(filterMentionCandidates(candidates, "mu")).toEqual([candidates[0]]);
  });

  it("filters by title substring", () => {
    expect(filterMentionCandidates(candidates, "nvidia")).toEqual([candidates[1]]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterMentionCandidates(candidates, "tsla")).toEqual([]);
  });
});

describe("insertMention", () => {
  it("replaces the trigger span with the mention path and a trailing space", () => {
    const result = insertMention("hi @MU trend", 6, { start: 3, query: "MU" }, "stocks/MU.md");
    expect(result.text).toBe("hi @stocks/MU.md  trend");
    expect(result.cursor).toBe("hi @stocks/MU.md ".length);
  });

  it("works when the trigger is at the start of an empty value", () => {
    const result = insertMention("@", 1, { start: 0, query: "" }, "stocks/MU.md");
    expect(result.text).toBe("@stocks/MU.md ");
    expect(result.cursor).toBe("@stocks/MU.md ".length);
  });

  it("regression: a stale cursor (captured before the caret moved via click/arrow keys, not onChange) corrupts the slice", () => {
    const value = "@MU then typed a lot more";
    const trigger = detectMentionTrigger(value, 3);
    expect(trigger).toEqual({ start: 0, query: "MU" });

    const liveCursor = 3;
    const staleCursor = 2;

    const withLiveCursor = insertMention(value, liveCursor, trigger!, "stocks/MU.md");
    const withStaleCursor = insertMention(value, staleCursor, trigger!, "stocks/MU.md");

    expect(withLiveCursor.text).toBe("@stocks/MU.md  then typed a lot more");
    expect(withStaleCursor.text).not.toBe(withLiveCursor.text);
    expect(withStaleCursor.text).toBe("@stocks/MU.md U then typed a lot more");
  });
});

describe("visible mention references", () => {
  const candidates = [
    { path: "stocks/MU.md", title: "Micron" },
    { path: "stocks/NVDA.md", title: "Nvidia" },
  ];

  it("returns known references in library order without duplicating them", () => {
    expect(findMentionedCandidates("compare @stocks/NVDA.md and @stocks/MU.md, then @stocks/NVDA.md", candidates)).toEqual([
      candidates[0],
      candidates[1],
    ]);
  });

  it("ignores free-form @ text that is not a known research path", () => {
    expect(findMentionedCandidates("tell @someone about @stocks/MU.md", candidates)).toEqual([candidates[0]]);
  });

  it("removes a selected reference without damaging the surrounding prompt", () => {
    expect(removeMention("compare @stocks/NVDA.md and @stocks/MU.md", "stocks/NVDA.md")).toBe("compare and @stocks/MU.md");
    expect(removeMention("@stocks/MU.md check supply", "stocks/MU.md")).toBe("check supply");
  });
});
