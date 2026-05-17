import { describe, expect, it } from "vitest";
import { PERSONAS } from "@/data/personas";
import {
  countByCluster,
  filterPersonas,
  getAllTraits,
  parseFilterState,
  personaMatchesQuery,
} from "@/lib/persona-filters";

describe("personaMatchesQuery", () => {
  it("matches title and traits", () => {
    const rookie = PERSONAS.find((p) => p.id === "wide-eyed-rookie");
    expect(rookie).toBeDefined();
    expect(personaMatchesQuery(rookie!, "rookie")).toBe(true);
    expect(personaMatchesQuery(rookie!, "blackfly")).toBe(true);
    expect(personaMatchesQuery(rookie!, "canoe captain")).toBe(false);
  });
});

describe("filterPersonas", () => {
  it("filters by cluster and trait together", () => {
    const filtered = filterPersonas(PERSONAS, {
      query: "",
      clusterId: "engagement",
      trait: "Deep Presence",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("heart-centered-listener");
  });

  it("filters by search query across fields", () => {
    const filtered = filterPersonas(PERSONAS, {
      query: "lifeguard",
      clusterId: "all",
      trait: null,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("waterfront-sentinel");
  });
});

describe("parseFilterState", () => {
  it("rejects invalid cluster ids", () => {
    const result = parseFilterState({
      query: "ok",
      clusterId: "invalid",
      trait: null,
    });
    expect(result.ok).toBe(false);
  });

  it("accepts valid state", () => {
    const result = parseFilterState({
      query: "lake",
      clusterId: "domain",
      trait: null,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.clusterId).toBe("domain");
    }
  });
});

describe("getAllTraits", () => {
  it("returns sorted unique traits", () => {
    const traits = getAllTraits();
    expect(traits.length).toBeGreaterThan(10);
    expect([...traits]).toEqual(
      [...traits].sort((a, b) => a.localeCompare(b)),
    );
  });
});

describe("countByCluster", () => {
  it("counts three per cluster", () => {
    const counts = countByCluster(PERSONAS);
    expect(counts.experience).toBe(3);
    expect(counts.motivation).toBe(3);
    expect(counts.engagement).toBe(3);
    expect(counts.domain).toBe(3);
  });
});
