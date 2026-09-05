import { describe, expect, it } from "vitest";
import { PERSONAS } from "@/data/personas";
import { buildCampSwarm, projectSwarmToPlane } from "@/lib/camp-swarm";
import {
  clampWorld,
  dragDidMove,
  parsePlanePoint,
  placeOrbFromPlane,
  planeToWorld,
  resolveOrbWorld,
  upsertOrbPlacement,
} from "@/lib/camp-swarm-placement";

describe("planeToWorld", () => {
  it("round-trips a mid-lake point while keeping altitude", () => {
    const world = planeToWorld({ x: 50, y: 48 }, 12);
    expect(world.y).toBe(12);
    expect(world.x).toBeCloseTo(0, 5);
    const back = projectSwarmToPlane(world);
    expect(back.x).toBeCloseTo(50, 0);
    expect(back.y).toBeCloseTo(48, 0);
  });
});

describe("placeOrbFromPlane", () => {
  it("moves an orb on the lake without losing its id", () => {
    const swarm = buildCampSwarm(PERSONAS);
    const orb = swarm.orbs[0];
    if (!orb) throw new Error("missing orb");
    const next = placeOrbFromPlane(orb, { x: 70, y: 30 }, {});
    expect(next).not.toEqual(orb.position);
    expect(resolveOrbWorld(orb, { [orb.personaId]: next })).toEqual(next);
  });
});

describe("clampWorld", () => {
  it("keeps orbs inside the staff-room volume", () => {
    const clamped = clampWorld({ x: 400, y: -200, z: -400 });
    expect(clamped.x).toBeLessThanOrEqual(110);
    expect(clamped.y).toBeGreaterThanOrEqual(-40);
    expect(clamped.z).toBeGreaterThanOrEqual(-90);
  });
});

describe("parsePlanePoint", () => {
  it("rejects out-of-range percents", () => {
    expect(parsePlanePoint({ x: 140, y: 10 }).ok).toBe(false);
    expect(parsePlanePoint({ x: 40, y: 20 }).ok).toBe(true);
  });
});

describe("dragDidMove", () => {
  it("treats tiny motion as a click", () => {
    expect(dragDidMove(10, 10, 12, 11)).toBe(false);
    expect(dragDidMove(10, 10, 40, 40)).toBe(true);
  });
});

describe("upsertOrbPlacement", () => {
  it("stores a clamped world point for a known counsellor", () => {
    const swarm = buildCampSwarm(PERSONAS);
    const orb = swarm.orbs[0];
    if (!orb) throw new Error("missing orb");
    const next = upsertOrbPlacement({}, orb.personaId, { x: 24, y: 10, z: -12 });
    expect(next.ok).toBe(true);
    if (!next.ok) return;
    expect(next.value[orb.personaId]).toEqual({ x: 24, y: 10, z: -12 });
  });

  it("rejects an unknown orb id", () => {
    expect(upsertOrbPlacement({}, "not-a-counsellor", { x: 0, y: 0, z: 0 }).ok).toBe(
      false,
    );
  });
});
