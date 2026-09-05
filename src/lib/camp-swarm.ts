import { z } from "zod";
import {
  PERSONA_IDS,
  PERSONAS,
  type Persona,
  type PersonaClusterId,
} from "@/data/personas";
import { err, ok, type Result } from "@/lib/result";

export const SWARM_HUE = 186;

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type SwarmOrbTone = {
  hue: number;
  saturation: number;
  lightness: number;
  hex: number;
  css: string;
  emissiveHex: number;
};

export type SwarmOrb = {
  personaId: string;
  title: string;
  shortLabel: string;
  clusterId: PersonaClusterId;
  position: Vec3;
  tone: SwarmOrbTone;
  phase: number;
  talkCue: string;
};

export type SwarmLinkKind = "cluster" | "staff-room";

export type SwarmLink = {
  fromId: string;
  toId: string;
  kind: SwarmLinkKind;
};

export type CampSwarm = {
  orbs: SwarmOrb[];
  links: SwarmLink[];
};

export const swarmOrbIdSchema = z.enum(PERSONA_IDS);

const STAFF_ROOM_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["seasoned-sentinel", "boundary-guardian"],
  ["northern-lifer", "wilderness-steward"],
  ["impact-driven-mentor", "heart-centered-listener"],
  ["energy-architect", "expressive-catalyst"],
  ["waterfront-sentinel", "boundary-guardian"],
  ["wide-eyed-rookie", "professional-developer"],
  ["adventure-escapee", "wilderness-steward"],
  ["waterfront-sentinel", "adventure-escapee"],
  ["heart-centered-listener", "wide-eyed-rookie"],
  ["energy-architect", "wide-eyed-rookie"],
];

const MEMBER_OFFSETS: readonly Vec3[] = [
  { x: -16, y: 8, z: 10 },
  { x: 16, y: -4, z: 8 },
  { x: 0, y: 6, z: -16 },
];

export function shortPersonaLabel(title: string): string {
  return title.replace(/^The\s+/i, "").trim();
}

export function hslToHex(hue: number, saturation: number, lightness: number): number {
  const sl = saturation / 100;
  const ll = lightness / 100;
  const chroma = sl * Math.min(ll, 1 - ll);
  const channel = (n: number): number => {
    const k = (n + hue / 30) % 12;
    const mix = ll - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * mix);
  };
  const r = channel(0);
  const g = channel(8);
  const b = channel(4);
  return (r << 16) | (g << 8) | b;
}

export function hexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

export function toneForIndex(index: number, total: number): SwarmOrbTone {
  const span = Math.max(total - 1, 1);
  const t = index / span;
  const saturation = 92 - t * 20;
  const lightness = 30 + t * 40;
  const hex = hslToHex(SWARM_HUE, saturation, lightness);
  const emissiveHex = hslToHex(SWARM_HUE, saturation, Math.max(18, lightness - 22));
  return {
    hue: SWARM_HUE,
    saturation,
    lightness,
    hex,
    css: hexToCss(hex),
    emissiveHex,
  };
}

export function clusterAnchor(clusterId: PersonaClusterId): Vec3 {
  switch (clusterId) {
    case "experience":
      return { x: -70, y: 28, z: 12 };
    case "motivation":
      return { x: 68, y: 34, z: 16 };
    case "engagement":
      return { x: -48, y: -8, z: -56 };
    case "domain":
      return { x: 56, y: -4, z: -52 };
    default: {
      const exhaustive: never = clusterId;
      throw new Error(`Unhandled cluster: ${String(exhaustive)}`);
    }
  }
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function parseSwarmOrbId(value: unknown): Result<string, string> {
  const parsed = swarmOrbIdSchema.safeParse(value);
  if (!parsed.success) {
    return err("Unknown camp orb id");
  }
  return ok(parsed.data);
}

export function talkingPairAt(
  tick: number,
  links: SwarmLink[],
): Result<SwarmLink, string> {
  if (links.length === 0) {
    return err("No communication links");
  }
  const index = ((tick % links.length) + links.length) % links.length;
  const link = links[index];
  if (!link) {
    return err("Missing communication link");
  }
  return ok(link);
}

export function formatTalkBeat(from: SwarmOrb, to: SwarmOrb): string {
  return `${from.shortLabel} → ${to.shortLabel}: ${from.talkCue}`;
}

export function findOrb(
  orbs: SwarmOrb[],
  personaId: string,
): Result<SwarmOrb, string> {
  const orb = orbs.find((item) => item.personaId === personaId);
  if (!orb) {
    return err(`No orb assigned to ${personaId}`);
  }
  return ok(orb);
}

export function buildCampSwarm(personas: Persona[] = PERSONAS): CampSwarm {
  const clusterCounts = new Map<PersonaClusterId, number>();
  const orbs = personas.map((persona, index) => {
    const memberIndex = clusterCounts.get(persona.clusterId) ?? 0;
    clusterCounts.set(persona.clusterId, memberIndex + 1);
    const offset = MEMBER_OFFSETS[memberIndex % MEMBER_OFFSETS.length] ?? {
      x: 0,
      y: 0,
      z: 0,
    };
    return {
      personaId: persona.id,
      title: persona.title,
      shortLabel: shortPersonaLabel(persona.title),
      clusterId: persona.clusterId,
      position: addVec3(clusterAnchor(persona.clusterId), offset),
      tone: toneForIndex(index, personas.length),
      phase: index * 1.7,
      talkCue: persona.motivations[0] ?? persona.traits[0] ?? persona.title,
    };
  });

  return {
    orbs,
    links: [...clusterLinks(personas), ...staffRoomLinks(orbs)],
  };
}

function clusterLinks(personas: Persona[]): SwarmLink[] {
  const groups = new Map<PersonaClusterId, string[]>();
  for (const persona of personas) {
    const ids = groups.get(persona.clusterId) ?? [];
    ids.push(persona.id);
    groups.set(persona.clusterId, ids);
  }

  const links: SwarmLink[] = [];
  for (const ids of groups.values()) {
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const fromId = ids[i];
        const toId = ids[j];
        if (!fromId || !toId) continue;
        links.push({ fromId, toId, kind: "cluster" });
      }
    }
  }
  return links;
}

function staffRoomLinks(orbs: SwarmOrb[]): SwarmLink[] {
  const known = new Set(orbs.map((orb) => orb.personaId));
  const seen = new Set<string>();
  const links: SwarmLink[] = [];

  for (const [fromId, toId] of STAFF_ROOM_PAIRS) {
    if (!known.has(fromId) || !known.has(toId) || fromId === toId) continue;
    const key = pairKey(fromId, toId);
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ fromId, toId, kind: "staff-room" });
  }

  return links;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}
