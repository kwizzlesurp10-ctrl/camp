import { z } from "zod";
import type { Persona, PersonaClusterId } from "@/data/personas";
import { PERSONAS } from "@/data/personas";
import { err, ok, type Result } from "@/lib/result";

export type PersonaFilterState = {
  query: string;
  clusterId: PersonaClusterId | "all";
  trait: string | null;
};

const clusterIdSchema = z.enum([
  "experience",
  "motivation",
  "engagement",
  "domain",
  "all",
]);

const filterStateSchema = z.object({
  query: z.string().max(120),
  clusterId: clusterIdSchema,
  trait: z.string().max(80).nullable(),
});

export function parseFilterState(
  input: unknown,
): Result<PersonaFilterState, string> {
  const parsed = filterStateSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return ok(parsed.data);
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function personaMatchesQuery(persona: Persona, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;

  const haystack = [
    persona.title,
    persona.essence,
    persona.painPoints,
    persona.teenCommunication,
    ...persona.motivations,
    ...persona.traits,
    ...persona.tags.map((t) => t.label),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function filterPersonas(
  personas: Persona[],
  state: PersonaFilterState,
): Persona[] {
  return personas.filter((persona) => {
    if (state.clusterId !== "all" && persona.clusterId !== state.clusterId) {
      return false;
    }
    if (state.trait && !persona.traits.includes(state.trait)) {
      return false;
    }
    return personaMatchesQuery(persona, state.query);
  });
}

export function getAllTraits(personas: Persona[] = PERSONAS): string[] {
  const traits = new Set<string>();
  for (const persona of personas) {
    for (const trait of persona.traits) {
      traits.add(trait);
    }
  }
  return [...traits].sort((a, b) => a.localeCompare(b));
}

export function countByCluster(
  personas: Persona[],
): Record<PersonaClusterId, number> {
  return personas.reduce(
    (acc, persona) => {
      acc[persona.clusterId] += 1;
      return acc;
    },
    {
      experience: 0,
      motivation: 0,
      engagement: 0,
      domain: 0,
    } satisfies Record<PersonaClusterId, number>,
  );
}
