import type { Persona } from "@/data/personas";
import { getClusterById } from "@/data/personas";
import { toAgentExport, type AgentPersonaExport } from "@/lib/persona-export";
import { formatCampLetter, renderCampLetterText } from "@/lib/camp-staff-letter";

export type ChatMessage = {
  role: "user" | "staff" | "system";
  content: string;
};

export type StaffChatPacket = {
  staff: AgentPersonaExport;
  systemPrompt: string;
  scenario: string | null;
  userMessage: string;
  conversationHistory: ChatMessage[];
  replyGuidance: string;
  /** In-character draft the host model can refine or send as-is. */
  draftReply: string;
};

export function buildStaffSystemPrompt(
  persona: Persona,
  scenario?: string | null,
): string {
  const exportShape = toAgentExport(persona);
  const cluster = getClusterById(persona.clusterId);

  const scenarioBlock = scenario?.trim()
    ? `\n## Active scenario\n${scenario.trim()}\n`
    : "";

  return [
    `You are roleplaying as northern summer camp staff: ${exportShape.title}.`,
    "Stay fully in character. Speak like a real counsellor on a northern teenage camp — warm, practical, and grounded. Avoid breaking character or mentioning that you are an AI unless the user asks out of band.",
    "",
    "## Persona card",
    JSON.stringify(exportShape, null, 2),
    "",
    `Cluster: ${cluster?.label ?? persona.clusterId}`,
    cluster?.description ? `Cluster focus: ${cluster.description}` : "",
    "",
    "## Voice & method",
    `- Essence: ${persona.essence}`,
    `- Motivations: ${persona.motivations.join("; ")}`,
    `- Pain points: ${persona.painPoints}`,
    `- How you talk with teens: ${persona.teenCommunication}`,
    `- Signature traits: ${persona.traits.join(", ")}`,
    scenarioBlock,
    "## Reply rules",
    "- Reply in first person as this staff member.",
    "- Keep replies concise (2–6 short paragraphs or a short dialogue beat) unless the user asks for a plan, script, or training debrief.",
    "- Prefer concrete camp details (cabin, dock, trail, mess hall, blackflies, canoe) over abstract advice.",
    "- If the user is a director, trainer, or parent, still answer as this staffer — give staff-room honesty, not corporate PR.",
    "- If safety is at stake (water, missing camper, self-harm, abuse), prioritise clear safety steps and escalate to leadership / protocols.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

/**
 * Lightweight draft without an external LLM — mirrors persona voice so MCP
 * clients get something useful immediately; hosts may regenerate with the
 * system prompt for higher quality.
 */
export function buildDraftStaffReply(
  persona: Persona,
  message: string,
  scenario?: string | null,
): string {
  const title = persona.title.replace(/^The\s+/i, "");
  const firstNameCue = title.split(/\s+/)[0] ?? "Counsellor";
  const scenarioNote = scenario?.trim()
    ? ` (thinking about: ${scenario.trim()})`
    : "";

  return [
    `Hey — ${firstNameCue} here${scenarioNote}.`,
    "",
    `I hear you on: “${truncate(message.trim(), 160)}”`,
    "",
    `From where I sit (${persona.traits.slice(0, 2).join(" · ")}), the move is stay present, not polish-perfect. ${persona.teenCommunication}`,
    "",
    `What usually gets me is ${firstSentence(persona.painPoints).toLowerCase()} So if we’re dealing with that energy, I slow down and make the next step tiny.`,
    "",
    `Want the cabin-floor version or the director debrief?`,
  ].join("\n");
}

export function buildStaffChatPacket(
  persona: Persona,
  message: string,
  options?: {
    scenario?: string | null;
    conversationHistory?: ChatMessage[];
  },
): StaffChatPacket {
  const scenario = options?.scenario?.trim() || null;
  const conversationHistory = options?.conversationHistory ?? [];

  return {
    staff: toAgentExport(persona),
    systemPrompt: buildStaffSystemPrompt(persona, scenario),
    scenario,
    userMessage: message,
    conversationHistory,
    replyGuidance:
      "Respond to the user in character using systemPrompt. Prefer improving draftReply rather than ignoring the persona card. Keep safety first.",
    draftReply: buildDraftStaffReply(persona, message, scenario),
  };
}

export function formatStaffChatForMcp(packet: StaffChatPacket): string {
  const persona = { id: packet.staff.id } as Persona;
  const letter = formatCampLetter(
    { ...persona, title: packet.staff.title, tags: [], essence: packet.staff.essence, motivations: [], painPoints: "", teenCommunication: "", traits: packet.staff.traits, clusterId: "experience" },
    packet.userMessage,
    packet.draftReply,
  );
  const letterText = renderCampLetterText(letter);

  return [
    "# Camp staff chat",
    "",
    `**Staff:** ${packet.staff.title} (\`${packet.staff.id}\`)`,
    `**Cluster:** ${packet.staff.cluster}`,
    packet.scenario ? `**Scenario:** ${packet.scenario}` : null,
    "",
    "## How to use this",
    packet.replyGuidance,
    "",
    "## Staff letter (in character)",
    "```",
    letterText,
    "```",
    "",
    "## Draft reply (raw)",
    packet.draftReply,
    "",
    "## System prompt (for the host model)",
    "```",
    packet.systemPrompt,
    "```",
    "",
    "## User message",
    packet.userMessage,
    packet.conversationHistory.length
      ? [
          "",
          "## Prior turns",
          ...packet.conversationHistory.map(
            (m) => `- **${m.role}:** ${m.content}`,
          ),
        ].join("\n")
      : null,
  ]
    .filter((block) => block != null && block !== "")
    .join("\n");
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^(.+?[.!?])(\s|$)/);
  return match?.[1] ?? trimmed;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
