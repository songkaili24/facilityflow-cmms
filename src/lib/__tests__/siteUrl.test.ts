import { describe, expect, it } from "vitest";
import { getSiteUrl } from "../siteUrl";

describe("getSiteUrl", () => {
  it("returns the configured URL when set", () => {
    expect(getSiteUrl("https://facilityflow.vercel.app")).toBe(
      "https://facilityflow.vercel.app",
    );
  });

  it("falls back to localhost when the env var is unset", () => {
    expect(getSiteUrl(undefined)).toBe("http://localhost:3000");
  });

  it("falls back when the env var is an empty string (regression: new URL('') threw on Vercel)", () => {
    expect(getSiteUrl("")).toBe("http://localhost:3000");
  });

  it("falls back when the env var is whitespace only", () => {
    expect(getSiteUrl("   ")).toBe("http://localhost:3000");
  });

  it("trims surrounding whitespace from a valid value", () => {
    expect(getSiteUrl(" https://facilityflow.vercel.app ")).toBe(
      "https://facilityflow.vercel.app",
    );
  });
});
