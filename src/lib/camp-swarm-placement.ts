import { z } from "zod";
import {
  parseSwarmOrbId,
  projectSwarmToPlane,
  type PlanePoint,
  type SwarmOrb,
  type Vec3,
} from "@/lib/camp-swarm";
import { err, ok, type Result } from "@/lib/result";

export const DRAG_CLICK_SLOP_PX = 6;

export const WORLD_BOUNDS = {
  x: { min: -110, max: 110 },
  y: { min: -40, max: 70 },
  z: { min: -90, max: 90 },
} as const;

const planePointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const vec3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

export type OrbPlacements = Record<string, Vec3>;

export function parsePlanePoint(input: unknown): Result<PlanePoint, string> {
  const parsed = planePointSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues.map((issue) => issue.message).join("; "));
  }
  return ok(parsed.data);
}

export function parseWorldPoint(input: unknown): Result<Vec3, string> {
  const parsed = vec3Schema.safeParse(input);
  if (!parsed.success) {
    return err("Invalid orb world point");
  }
  return ok(clampWorld(parsed.data));
}

export function clampPlane(point: PlanePoint): PlanePoint {
  return {
    x: clamp(point.x, 8, 92),
    y: clamp(point.y, 8, 92),
  };
}

export function clampWorld(position: Vec3): Vec3 {
  return {
    x: clamp(position.x, WORLD_BOUNDS.x.min, WORLD_BOUNDS.x.max),
    y: clamp(position.y, WORLD_BOUNDS.y.min, WORLD_BOUNDS.y.max),
    z: clamp(position.z, WORLD_BOUNDS.z.min, WORLD_BOUNDS.z.max),
  };
}

export function planeToWorld(plane: PlanePoint, altitudeY: number): Vec3 {
  const safe = clampPlane(plane);
  return clampWorld({
    x: (safe.x - 50) / 0.38,
    y: altitudeY,
    z: (48 - safe.y - altitudeY * 0.12) / 0.32,
  });
}

export function resolveOrbWorld(orb: SwarmOrb, placements: OrbPlacements): Vec3 {
  return placements[orb.personaId] ?? orb.position;
}

export function resolveOrbPlane(orb: SwarmOrb, placements: OrbPlacements): PlanePoint {
  return projectSwarmToPlane(resolveOrbWorld(orb, placements));
}

export function placeOrbFromPlane(
  orb: SwarmOrb,
  plane: PlanePoint,
  placements: OrbPlacements,
): Vec3 {
  const current = resolveOrbWorld(orb, placements);
  return planeToWorld(plane, current.y);
}

export function upsertOrbPlacement(
  placements: OrbPlacements,
  personaId: unknown,
  position: unknown,
): Result<OrbPlacements, string> {
  const id = parseSwarmOrbId(personaId);
  if (!id.ok) return err(id.error);
  const point = parseWorldPoint(position);
  if (!point.ok) return err(point.error);
  return ok({ ...placements, [id.value]: point.value });
}

export function dragDidMove(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  slop: number = DRAG_CLICK_SLOP_PX,
): boolean {
  const dx = currentX - startX;
  const dy = currentY - startY;
  return dx * dx + dy * dy > slop * slop;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
