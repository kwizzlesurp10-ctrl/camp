import { generateText } from "ai";
import type { Persona } from "@/data/personas";
import {
  buildDraftStaffReply,
  buildStaffSystemPrompt,
} from "@/lib/camp-staff-chat";

const AI_MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

function isAiConfigured(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN
  );
}

const LETTER_PROMPT_SUFFIX = [
  "",
  "Reply as a handwritten camp letter. Use 2–5 short paragraphs.",
  "Be concrete (cabin, dock, trail, mess hall, blackflies, canoe).",
  "Do NOT include letterhead, FROM/TO, salutation, or closing — just the body paragraphs.",
].join("\n");

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
      prompt: `${question}\n${LETTER_PROMPT_SUFFIX}`,
      maxOutputTokens: 800,
      temperature: 0.8,
    });

    return clipLetterBody(result.text, 1200);
  } catch {
    return buildDraftStaffReply(persona, question);
  }
}

function clipLetterBody(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "Standing by at the dock.";
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
