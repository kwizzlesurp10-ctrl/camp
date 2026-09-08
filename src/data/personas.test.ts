import { describe, expect, it } from "vitest";
import {
  PERSONA_CLUSTERS,
  PERSONA_IDS,
  PERSONAS,
  type PersonaClusterId,
} from "@/data/personas";
import { STAFF_ROOM_PAIRS } from "@/lib/camp-swarm";
import { DOMAIN_HINTS } from "@/lib/camp-swarm-talk";

const CLUSTER_IDS: readonly PersonaClusterId[] = [
  "experience",
  "motivation",
  "engagement",
  "domain",
];

describe("persona roster", () => {
  it("holds twelve counsellors across four clusters of three", () => {
    expect(PERSONAS).toHaveLength(12);
    expect(PERSONA_CLUSTERS).toHaveLength(4);
    expect(PERSONA_IDS).toHaveLength(12);
    expect(new Set(PERSONA_IDS).size).toBe(12);
    for (const clusterId of CLUSTER_IDS) {
      expect(PERSONAS.filter((persona) => persona.clusterId === clusterId)).toHaveLength(3);
    }
  });
});

describe("staff-room graph ids", () => {
  it("only wires pairs that exist on the roster", () => {
    const known = new Set(PERSONA_IDS);
    for (const [fromId, toId] of STAFF_ROOM_PAIRS) {
      expect(known.has(fromId)).toBe(true);
      expect(known.has(toId)).toBe(true);
      expect(fromId).not.toBe(toId);
    }
  });
});

describe("talk domain hints", () => {
  it("only boosts known counsellor ids", () => {
    const known = new Set(PERSONA_IDS);
    for (const hint of DOMAIN_HINTS) {
      expect(known.has(hint.personaId)).toBe(true);
      expect(hint.tokens.length).toBeGreaterThan(0);
    }
  });
});
