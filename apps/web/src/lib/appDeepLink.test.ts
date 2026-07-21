import { describe, expect, it } from "vitest";
import { parseAppDeepLink } from "../../../../packages/shared/appDeepLink.js";

describe("parseAppDeepLink", () => {
  it("accepts local app origins and the app:// scheme", () => {
    expect(parseAppDeepLink("http://localhost:5199/notes")?.route).toBe("/notes");
    expect(parseAppDeepLink("http://127.0.0.1:5199/notes")?.route).toBe("/notes");
    expect(parseAppDeepLink("/notes")?.route).toBe("/notes");
    expect(parseAppDeepLink("app://-/notes")?.route).toBe("/notes");
  });

  it("keeps the query string in the route", () => {
    expect(parseAppDeepLink("/notes?id=42")?.route).toBe("/notes?id=42");
  });

  it("rejects foreign origins", () => {
    expect(parseAppDeepLink("https://example.com/notes")).toBeNull();
    expect(parseAppDeepLink("http://localhost:8080/notes")).toBeNull();
  });

  it("rejects garbage input", () => {
    expect(parseAppDeepLink(undefined)).toBeNull();
    expect(parseAppDeepLink("not a url")).toBeNull();
  });
});
