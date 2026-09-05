import { describe, expect, it } from "vitest";
import { PERSONAS } from "@/data/personas";
import { buildCampSwarm } from "@/lib/camp-swarm";
import {
  DIRECTOR_ORIGIN,
  DIRECTOR_SPEAKER_ID,
  formatDirectedBeat,
  parseStaffQuestion,
  planStaffRoomConversation,
  resolveSpeakerPosition,
  scorePersonaForQuestion,
  selectResponders,
  tokenizeQuestion,
} from "@/lib/camp-swarm-talk";

describe("parseStaffQuestion", () => {
  it("accepts a real staff-room question", () => {
    const parsed = parseStaffQuestion("Kid wants to skip the swim test");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toBe("Kid wants to skip the swim test");
  });

  it("rejects empty and oversized input", () => {
    expect(parseStaffQuestion("hi").ok).toBe(false);
    expect(parseStaffQuestion("x".repeat(281)).ok).toBe(false);
  });
});

describe("scorePersonaForQuestion", () => {
  it("routes waterfront questions to the sentinel", () => {
    const tokens = tokenizeQuestion("Kid wants to skip the swim test at the lake");
    const scores = PERSONAS.map((persona) => ({
      id: persona.id,
      score: scorePersonaForQuestion(persona, tokens),
    })).sort((a, b) => b.score - a.score);
    expect(scores[0]?.id).toBe("waterfront-sentinel");
    expect(scores[0]?.score).toBeGreaterThan(scores[1]?.score ?? 0);
  });

  it("routes midnight feelings to the listener", () => {
    const tokens = tokenizeQuestion("Homesick camper crying at midnight");
    const listener = PERSONAS.find((persona) => persona.id === "heart-centered-listener");
    const architect = PERSONAS.find((persona) => persona.id === "energy-architect");
    if (!listener || !architect) throw new Error("missing fixtures");
    expect(scorePersonaForQuestion(listener, tokens)).toBeGreaterThan(
      scorePersonaForQuestion(architect, tokens),
    );
  });
});

describe("selectResponders", () => {
  it("returns two distinct camp agents", () => {
    const picked = selectResponders("Rainy day and morale is in the dirt");
    expect(picked.ok).toBe(true);
    if (!picked.ok) return;
    expect(picked.value).toHaveLength(2);
    expect(picked.value[0]?.id).not.toBe(picked.value[1]?.id);
    expect(picked.value[0]?.id).toBe("energy-architect");
  });

  it("falls back when the question has no domain signal", () => {
    const picked = selectResponders("zzz qqq xxx");
    expect(picked.ok).toBe(true);
    if (!picked.ok) return;
    expect(picked.value.map((persona) => persona.id)).toEqual([
      "seasoned-sentinel",
      "heart-centered-listener",
    ]);
  });
});

describe("planStaffRoomConversation", () => {
  it("builds directed user and staff beats", () => {
    const planned = planStaffRoomConversation("Kid wants to skip the swim test");
    expect(planned.ok).toBe(true);
    if (!planned.ok) return;

    expect(planned.value[0]).toMatchObject({
      fromId: DIRECTOR_SPEAKER_ID,
      kind: "user-ask",
    });
    expect(planned.value[0]?.toId).toBe("waterfront-sentinel");
    expect(planned.value.some((beat) => beat.kind === "staff-reply")).toBe(true);
    expect(planned.value.some((beat) => beat.kind === "staff-handoff")).toBe(true);

    for (const beat of planned.value) {
      expect(beat.fromId).not.toBe(beat.toId);
      expect(beat.text.length).toBeGreaterThan(0);
    }
  });

  it("fails closed on invalid questions", () => {
    expect(planStaffRoomConversation("no").ok).toBe(false);
  });
});

describe("resolveSpeakerPosition", () => {
  const swarm = buildCampSwarm();

  it("places the director at the dock origin", () => {
    const pos = resolveSpeakerPosition(DIRECTOR_SPEAKER_ID, swarm.orbs);
    expect(pos).toEqual({ ok: true, value: DIRECTOR_ORIGIN });
  });

  it("uses the assigned orb for a counsellor", () => {
    const pos = resolveSpeakerPosition("waterfront-sentinel", swarm.orbs);
    const orb = swarm.orbs.find((item) => item.personaId === "waterfront-sentinel");
    expect(pos.ok).toBe(true);
    if (pos.ok) expect(pos.value).toEqual(orb?.position);
  });
});

describe("formatDirectedBeat", () => {
  it("names both ends and the direction", () => {
    const swarm = buildCampSwarm();
    const line = formatDirectedBeat(
      {
        fromId: DIRECTOR_SPEAKER_ID,
        toId: "waterfront-sentinel",
        kind: "user-ask",
        text: "Swim test?",
      },
      swarm.orbs,
    );
    expect(line).toContain("Director → Waterfront Sentinel");
    expect(line).toContain("ask");
    expect(line).toContain("Swim test?");
  });
});
