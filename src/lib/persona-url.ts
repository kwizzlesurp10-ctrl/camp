import { z } from "zod";
import { PERSONA_IDS } from "@/data/personas";
import { err, ok, type Result } from "@/lib/result";

export const PERSONA_QUERY_KEY = "persona" as const;

export const personaIdSchema = z.enum(PERSONA_IDS);

export function parsePersonaIdParam(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = personaIdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function buildPersonaSearchParams(
  personaId: string,
  existing?: URLSearchParams | string,
): URLSearchParams {
  const params =
    typeof existing === "string"
      ? new URLSearchParams(existing)
      : new URLSearchParams(existing?.toString() ?? "");
  params.set(PERSONA_QUERY_KEY, personaId);
  return params;
}

export function buildPersonaHref(
  pathname: string,
  personaId: string,
  existing?: URLSearchParams | string,
): string {
  const params = buildPersonaSearchParams(personaId, existing);
  return `${pathname}?${params.toString()}`;
}

export function clearPersonaFromSearchParams(
  existing?: URLSearchParams | string,
): URLSearchParams {
  const params =
    typeof existing === "string"
      ? new URLSearchParams(existing)
      : new URLSearchParams(existing?.toString() ?? "");
  params.delete(PERSONA_QUERY_KEY);
  return params;
}

export function buildHrefWithoutPersona(
  pathname: string,
  existing?: URLSearchParams | string,
): string {
  const params = clearPersonaFromSearchParams(existing);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function validatePersonaId(id: string): Result<string, string> {
  const parsed = personaIdSchema.safeParse(id);
  if (!parsed.success) {
    return err(`Unknown persona id: ${id}`);
  }
  return ok(parsed.data);
}
