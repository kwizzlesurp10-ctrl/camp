import { z } from "zod";
import {
  PERSONAS,
  PERSONA_CLUSTERS,
  getPersonaById,
  type PersonaClusterId,
} from "@/data/personas";
import {
  buildStaffChatPacket,
  formatStaffChatForMcp,
  type ChatMessage,
} from "@/lib/camp-staff-chat";
import { toAgentExport } from "@/lib/persona-export";
import {
  filterPersonas,
  getAllTraits,
  type PersonaFilterState,
} from "@/lib/persona-filters";

export const STAFF_ID_VALUES = PERSONAS.map((p) => p.id) as [
  string,
  ...string[],
];

export const staffIdSchema = z.enum(STAFF_ID_VALUES);

export const clusterSchema = z.enum([
  "experience",
  "motivation",
  "engagement",
  "domain",
  "all",
]);

export const chatMessageSchema = z.object({
  role: z.enum(["user", "staff", "system"]),
  content: z.string().min(1).max(4000),
});

export function listStaffSummaries(cluster?: PersonaClusterId | "all") {
  const personas =
    !cluster || cluster === "all"
      ? PERSONAS
      : PERSONAS.filter((p) => p.clusterId === cluster);

  return {
    count: personas.length,
    clusters: PERSONA_CLUSTERS.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description,
    })),
    staff: personas.map((p) => {
      const exp = toAgentExport(p);
      return {
        id: exp.id,
        title: exp.title,
        cluster: exp.cluster,
        tags: exp.tags,
        traits: exp.traits,
        essence: exp.essence,
      };
    }),
  };
}

export function searchStaff(input: {
  query?: string;
  cluster?: z.infer<typeof clusterSchema>;
  trait?: string;
}) {
  const state: PersonaFilterState = {
    query: input.query ?? "",
    clusterId: input.cluster ?? "all",
    trait: input.trait?.trim() ? input.trait.trim() : null,
  };
  const matches = filterPersonas(PERSONAS, state).map(toAgentExport);
  return {
    count: matches.length,
    query: state,
    availableTraits: getAllTraits(),
    staff: matches,
  };
}

export function getStaffDetail(staffId: string) {
  const persona = getPersonaById(staffId);
  if (!persona) {
    return {
      ok: false as const,
      error: `Unknown staff id "${staffId}". Valid ids: ${STAFF_ID_VALUES.join(", ")}`,
    };
  }
  return {
    ok: true as const,
    staff: toAgentExport(persona),
    chatHint:
      "Call chat_with_camp_staff with this id and a message to open an in-character conversation.",
  };
}

export function chatWithStaff(input: {
  staff_id: string;
  message: string;
  scenario?: string;
  conversation_history?: ChatMessage[];
}) {
  const persona = getPersonaById(input.staff_id);
  if (!persona) {
    return {
      ok: false as const,
      error: `Unknown staff id "${input.staff_id}". Valid ids: ${STAFF_ID_VALUES.join(", ")}`,
    };
  }

  const packet = buildStaffChatPacket(persona, input.message, {
    scenario: input.scenario,
    conversationHistory: input.conversation_history,
  });

  return {
    ok: true as const,
    text: formatStaffChatForMcp(packet),
    packet,
  };
}

export function jsonText(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
