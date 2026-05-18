import { describe, expect, it } from "vitest";
import { PERSONAS } from "@/data/personas";
import { serializePersonaForAgents, toAgentExport } from "@/lib/persona-export";

describe("toAgentExport", () => {
  it("maps persona fields to flat agent shape", () => {
    const persona = PERSONAS[0];
    const exported = toAgentExport(persona);

    expect(exported.id).toBe(persona.id);
    expect(exported.title).toBe(persona.title);
    expect(exported.tags).toEqual(persona.tags.map((t) => t.label));
    expect(exported.motivations).toEqual(persona.motivations);
    expect(exported.traits).toEqual(persona.traits);
    expect(exported.cluster).toContain("Experience");
  });
});

describe("serializePersonaForAgents", () => {
  it("returns pretty-printed JSON", () => {
    const json = serializePersonaForAgents(PERSONAS[0]);
    const parsed = JSON.parse(json) as ReturnType<typeof toAgentExport>;
    expect(parsed.id).toBe(PERSONAS[0].id);
  });
});
