import { z } from "zod";
import {
  PERSONAS,
  getPersonaById,
  getPersonasByCluster,
  type Persona,
  type PersonaClusterId,
} from "@/data/personas";
import { toAgentExport, type AgentPersonaExport } from "@/lib/persona-export";
import { err, ok, type Result } from "@/lib/result";

export const API_VERSION = "1" as const;

export type PersonasListResponse = {
  version: typeof API_VERSION;
  generatedAt: string;
  count: number;
  personas: AgentPersonaExport[];
};

export type PersonaDetailResponse = {
  version: typeof API_VERSION;
  generatedAt: string;
  persona: AgentPersonaExport;
};

export type ApiErrorBody = {
  error: string;
  code: "NOT_FOUND" | "BAD_REQUEST";
};

const listQuerySchema = z.object({
  cluster: z
    .enum(["experience", "motivation", "engagement", "domain"])
    .optional(),
});

export function parsePersonasListQuery(
  searchParams: URLSearchParams,
): Result<{ cluster?: PersonaClusterId }, string> {
  const raw = {
    cluster: searchParams.get("cluster") ?? undefined,
  };
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return ok(parsed.data);
}

export function resolvePersonasList(cluster?: PersonaClusterId): Persona[] {
  if (!cluster) return PERSONAS;
  return getPersonasByCluster(cluster);
}

export function buildPersonasListResponse(
  personas: Persona[],
): PersonasListResponse {
  return {
    version: API_VERSION,
    generatedAt: new Date().toISOString(),
    count: personas.length,
    personas: personas.map(toAgentExport),
  };
}

export function buildPersonaDetailResponse(
  persona: Persona,
): PersonaDetailResponse {
  return {
    version: API_VERSION,
    generatedAt: new Date().toISOString(),
    persona: toAgentExport(persona),
  };
}

export function getPersonaForApi(id: string): Result<Persona, ApiErrorBody> {
  const persona = getPersonaById(id);
  if (!persona) {
    return err({ error: `Persona not found: ${id}`, code: "NOT_FOUND" });
  }
  return ok(persona);
}
