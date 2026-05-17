import { describe, expect, it } from "vitest";
import {
  buildPersonasListResponse,
  getPersonaForApi,
  parsePersonasListQuery,
  resolvePersonasList,
} from "@/lib/persona-api";

describe("parsePersonasListQuery", () => {
  it("parses cluster filter", () => {
    const params = new URLSearchParams("cluster=experience");
    const result = parsePersonasListQuery(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.cluster).toBe("experience");
    }
  });

  it("rejects invalid cluster", () => {
    const params = new URLSearchParams("cluster=invalid");
    const result = parsePersonasListQuery(params);
    expect(result.ok).toBe(false);
  });
});

describe("resolvePersonasList", () => {
  it("returns three personas per cluster", () => {
    expect(resolvePersonasList("domain")).toHaveLength(3);
    expect(resolvePersonasList()).toHaveLength(12);
  });
});

describe("getPersonaForApi", () => {
  it("returns not found for missing persona", () => {
    const result = getPersonaForApi("missing");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("buildPersonasListResponse", () => {
  it("includes agent export shape", () => {
    const response = buildPersonasListResponse(resolvePersonasList());
    expect(response.count).toBe(12);
    expect(response.personas[0]?.id).toBeTruthy();
    expect(response.personas[0]?.essence).toBeTruthy();
  });
});
