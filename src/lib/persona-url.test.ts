import { describe, expect, it } from "vitest";
import {
  buildPersonaHref,
  parsePersonaIdParam,
  validatePersonaId,
} from "@/lib/persona-url";

describe("parsePersonaIdParam", () => {
  it("accepts valid persona slugs", () => {
    expect(parsePersonaIdParam("wide-eyed-rookie")).toBe("wide-eyed-rookie");
  });

  it("rejects unknown slugs", () => {
    expect(parsePersonaIdParam("fake-persona")).toBeNull();
    expect(parsePersonaIdParam(null)).toBeNull();
  });
});

describe("buildPersonaHref", () => {
  it("preserves other query params", () => {
    const href = buildPersonaHref("/", "northern-lifer", "cluster=domain");
    expect(href).toBe("/?cluster=domain&persona=northern-lifer");
  });
});

describe("validatePersonaId", () => {
  it("returns error for invalid ids", () => {
    const result = validatePersonaId("not-real");
    expect(result.ok).toBe(false);
  });
});
