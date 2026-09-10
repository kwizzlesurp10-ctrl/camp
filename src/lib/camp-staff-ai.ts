import { generateText } from "ai";
import type { Persona } from "@/data/personas";
import {
  buildDraftStaffReply,
  buildStaffSystemPrompt,
} from "@/lib/camp-staff-chat";
import { shortPersonaLabel } from "@/lib/camp-swarm";

const AI_MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

function isAiConfigured(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN
  );
}

export async function generateStaffReply(
  persona: Persona,
  question: string,
): Promise<string> {
  if (!isAiConfigured()) {
    return buildDraftStaffReply(persona, question);
  }

  try {
    const result = await generateText({
      model: AI_MODEL,
      system: buildStaffSystemPrompt(persona),
      prompt: question,
      maxOutputTokens: 280,
      temperature: 0.8,
    });

    return clipReply(result.text, 200);
  } catch {
    return buildDraftStaffReply(persona, question);
  }
}

function clipReply(text: string, max: number): string {
  const firstParagraph = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const reply = firstParagraph ?? `${shortPersonaLabel("Staff")} is on it.`;
  if (reply.length <= max) return reply;
  return `${reply.slice(0, max - 1)}…`;
}
