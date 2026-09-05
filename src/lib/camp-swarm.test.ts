import { describe, expect, it } from "vitest";
import { PERSONAS } from "@/data/personas";
import {
  SWARM_HUE,
  buildCampSwarm,
  findOrb,
  formatTalkBeat,
  hexToCss,
  hslToHex,
  parseSwarmOrbId,
  shortPersonaLabel,
  talkingPairAt,
  toneForIndex,
} from "@/lib/camp-swarm";

describe("shortPersonaLabel", () => {
  it("strips the leading The", () => {
    expect(shortPersonaLabel("The Seasoned Sentinel")).toBe("Seasoned Sentinel");
  });
});

describe("toneForIndex", () => {
  it("keeps every orb on the same hue with unique tones", () => {
    const tones = PERSONAS.map((_, index) => toneForIndex(index, PERSONAS.length));
    const hexes = new Set(tones.map((tone) => tone.hex));
    expect(tones.every((tone) => tone.hue === SWARM_HUE)).toBe(true);
    expect(hexes.size).toBe(PERSONAS.length);
    expect(tones[0]?.lightness).toBeLessThan(tones[tones.length - 1]?.lightness ?? 0);
  });

  it("renders css hex from the numeric color", () => {
    expect(hexToCss(hslToHex(SWARM_HUE, 80, 50))).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("buildCampSwarm", () => {
  const swarm = buildCampSwarm();

  it("assigns one orb to every camp persona", () => {
    expect(swarm.orbs).toHaveLength(PERSONAS.length);
    expect(new Set(swarm.orbs.map((orb) => orb.personaId)).size).toBe(
      PERSONAS.length,
    );
  });

  it("places cluster mates near each other and apart from other clusters", () => {
    const experience = swarm.orbs.filter((orb) => orb.clusterId === "experience");
    const domain = swarm.orbs.filter((orb) => orb.clusterId === "domain");
    expect(experience).toHaveLength(3);
    const expCx =
      experience.reduce((sum, orb) => sum + orb.position.x, 0) / experience.length;
    const domainCx =
      domain.reduce((sum, orb) => sum + orb.position.x, 0) / domain.length;
    expect(Math.abs(expCx - domainCx)).toBeGreaterThan(80);
  });

  it("wires intra-cluster and staff-room communication links", () => {
    expect(swarm.links.some((link) => link.kind === "cluster")).toBe(true);
    expect(swarm.links.some((link) => link.kind === "staff-room")).toBe(true);
    for (const link of swarm.links) {
      expect(swarm.orbs.some((orb) => orb.personaId === link.fromId)).toBe(true);
      expect(swarm.orbs.some((orb) => orb.personaId === link.toId)).toBe(true);
      expect(link.fromId).not.toBe(link.toId);
    }
  });

  it("includes mentorship and safety staff-room pairs", () => {
    const keys = swarm.links.map((link) =>
      [link.fromId, link.toId].sort().join("::"),
    );
    expect(keys).toContain("boundary-guardian::seasoned-sentinel");
    expect(keys).toContain("northern-lifer::wilderness-steward");
  });
});

describe("parseSwarmOrbId", () => {
  it("accepts a real persona id", () => {
    const parsed = parseSwarmOrbId("waterfront-sentinel");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toBe("waterfront-sentinel");
  });

  it("rejects unknown ids", () => {
    const parsed = parseSwarmOrbId("planner");
    expect(parsed.ok).toBe(false);
  });
});

describe("talkingPairAt", () => {
  it("cycles through links", () => {
    const swarm = buildCampSwarm();
    const first = talkingPairAt(0, swarm.links);
    const next = talkingPairAt(1, swarm.links);
    const wrapped = talkingPairAt(swarm.links.length, swarm.links);
    expect(first.ok && next.ok && wrapped.ok).toBe(true);
    if (first.ok && next.ok && wrapped.ok) {
      expect(first.value).toEqual(wrapped.value);
      expect(first.value).not.toEqual(next.value);
    }
  });

  it("fails on an empty graph", () => {
    expect(talkingPairAt(0, []).ok).toBe(false);
  });
});

describe("formatTalkBeat", () => {
  it("names both counsellors and the cue", () => {
    const swarm = buildCampSwarm();
    const from = findOrb(swarm.orbs, "heart-centered-listener");
    const to = findOrb(swarm.orbs, "wide-eyed-rookie");
    expect(from.ok && to.ok).toBe(true);
    if (from.ok && to.ok) {
      const beat = formatTalkBeat(from.value, to.value);
      expect(beat).toContain("Heart-Centered Listener");
      expect(beat).toContain("Wide-Eyed Rookie");
      expect(beat).toContain(from.value.talkCue);
    }
  });
});
