import { z } from "zod";
import { PERSONAS, type Persona } from "@/data/personas";
import { buildDraftStaffReply } from "@/lib/camp-staff-chat";
import { generateStaffReply } from "@/lib/camp-staff-ai";
import { formatCampLetter, type CampLetter } from "@/lib/camp-staff-letter";
import {
  findOrb,
  shortPersonaLabel,
  type SwarmOrb,
  type Vec3,
} from "@/lib/camp-swarm";
import { err, ok, type Result } from "@/lib/result";

export const DIRECTOR_SPEAKER_ID = "director";

export const DIRECTOR_ORIGIN: Vec3 = { x: 0, y: 6, z: 8 };

export const TALK_BEAT_KINDS = ["user-ask", "staff-reply", "staff-handoff"] as const;

export const talkBeatKindSchema = z.enum(TALK_BEAT_KINDS);

export type TalkBeatKind = z.infer<typeof talkBeatKindSchema>;

export type TalkBeat = {
  fromId: string;
  toId: string;
  kind: TalkBeatKind;
  text: string;
  letter?: CampLetter;
};

export const staffQuestionSchema = z
  .string()
  .trim()
  .min(3, "Ask the staff room something a bit more specific")
  .max(280, "Keep the question under 280 characters");

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "her",
  "was",
  "one",
  "our",
  "out",
  "any",
  "how",
  "its",
  "who",
  "did",
  "now",
  "get",
  "got",
  "has",
  "have",
  "this",
  "that",
  "with",
  "from",
  "they",
  "them",
  "what",
  "when",
  "where",
  "your",
  "about",
  "just",
  "into",
  "over",
  "after",
  "then",
  "than",
  "some",
  "been",
  "will",
  "would",
  "should",
  "could",
  "there",
  "their",
  "want",
  "wants",
  "need",
  "needs",
  "help",
  "camp",
  "kid",
  "kids",
  "teen",
  "teens",
]);

export const DOMAIN_HINTS: ReadonlyArray<{
  tokens: readonly string[];
  personaId: string;
  weight: number;
}> = [
  {
    tokens: ["swim", "lake", "dock", "drown", "lifeguard", "canoe", "water", "boat"],
    personaId: "waterfront-sentinel",
    weight: 8,
  },
  {
    tokens: ["homesick", "crying", "feelings", "midnight", "listen", "lonely", "sad"],
    personaId: "heart-centered-listener",
    weight: 8,
  },
  {
    tokens: ["rule", "rules", "safety", "boundary", "no", "mean"],
    personaId: "boundary-guardian",
    weight: 7,
  },
  {
    tokens: ["rain", "rainy", "hype", "energy", "song", "morale", "dance"],
    personaId: "energy-architect",
    weight: 7,
  },
  {
    tokens: ["hike", "forest", "woods", "nature", "trail", "leave"],
    personaId: "wilderness-steward",
    weight: 7,
  },
  {
    tokens: ["art", "music", "drama", "talent", "draw", "song"],
    personaId: "expressive-catalyst",
    weight: 7,
  },
  {
    tokens: ["rookie", "first", "new", "nervous", "belong"],
    personaId: "wide-eyed-rookie",
    weight: 6,
  },
  {
    tokens: ["resume", "career", "director", "plan", "feedback"],
    personaId: "professional-developer",
    weight: 6,
  },
];

const FALLBACK_RESPONDERS = [
  "seasoned-sentinel",
  "heart-centered-listener",
] as const;

export function parseStaffQuestion(input: unknown): Result<string, string> {
  const parsed = staffQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues.map((issue) => issue.message).join("; "));
  }
  return ok(parsed.data);
}

export function tokenizeQuestion(question: string): string[] {
  return question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

export function scorePersonaForQuestion(persona: Persona, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  const haystack = [
    persona.id,
    persona.title,
    persona.essence,
    persona.painPoints,
    persona.teenCommunication,
    ...persona.motivations,
    ...persona.traits,
    ...persona.tags.map((tag) => tag.label),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (persona.id.includes(token)) score += 5;
    if (persona.title.toLowerCase().includes(token)) score += 4;
    if (persona.traits.some((trait) => trait.toLowerCase().includes(token))) score += 3;
    if (haystack.includes(token)) score += 1;
  }

  for (const hint of DOMAIN_HINTS) {
    if (hint.personaId !== persona.id) continue;
    if (hint.tokens.some((token) => tokens.includes(token))) {
      score += hint.weight;
    }
  }

  return score;
}

export function selectResponders(
  question: string,
  personas: Persona[] = PERSONAS,
): Result<Persona[], string> {
  const parsed = parseStaffQuestion(question);
  if (!parsed.ok) return parsed;

  const tokens = tokenizeQuestion(parsed.value);
  const ranked = [...personas]
    .map((persona) => ({ persona, score: scorePersonaForQuestion(persona, tokens) }))
    .sort((a, b) => b.score - a.score);

  const picked: Persona[] = [];
  for (const row of ranked) {
    if (row.score <= 0) break;
    picked.push(row.persona);
    if (picked.length === 2) break;
  }

  if (picked.length === 0) {
    for (const id of FALLBACK_RESPONDERS) {
      const persona = personas.find((item) => item.id === id);
      if (persona) picked.push(persona);
    }
  } else if (picked.length === 1) {
    const complement = complementResponder(picked[0], personas);
    if (complement) picked.push(complement);
  }

  if (picked.length === 0) {
    return err("No camp agents are on the lake");
  }

  return ok(picked);
}

export function planStaffRoomConversation(
  question: string,
  personas: Persona[] = PERSONAS,
): Result<TalkBeat[], string> {
  const parsed = parseStaffQuestion(question);
  if (!parsed.ok) return parsed;

  const responders = selectResponders(parsed.value, personas);
  if (!responders.ok) return responders;

  const [primary, secondary] = responders.value;
  if (!primary) return err("Staff room is empty");

  const primaryBody = draftLetterBody(primary, parsed.value);
  const primaryLetter = formatCampLetter(primary, parsed.value, primaryBody);

  const beats: TalkBeat[] = [
    {
      fromId: DIRECTOR_SPEAKER_ID,
      toId: primary.id,
      kind: "user-ask",
      text: parsed.value,
    },
    {
      fromId: primary.id,
      toId: DIRECTOR_SPEAKER_ID,
      kind: "staff-reply",
      text: compactStaffReply(primary, parsed.value),
      letter: primaryLetter,
    },
  ];

  if (secondary) {
    const secondaryBody = draftLetterBody(secondary, parsed.value);
    const secondaryLetter = formatCampLetter(secondary, parsed.value, secondaryBody);
    beats.push({
      fromId: primary.id,
      toId: secondary.id,
      kind: "staff-handoff",
      text: `${shortPersonaLabel(primary.title)} looping in ${shortPersonaLabel(secondary.title)} — ${secondary.traits[0] ?? secondary.title}.`,
    });
    beats.push({
      fromId: secondary.id,
      toId: DIRECTOR_SPEAKER_ID,
      kind: "staff-reply",
      text: compactStaffReply(secondary, parsed.value),
      letter: secondaryLetter,
    });
  }

  return ok(beats);
}

export function isDirectorSpeaker(id: string): boolean {
  return id === DIRECTOR_SPEAKER_ID;
}

export function resolveSpeakerPosition(
  speakerId: string,
  orbs: SwarmOrb[],
): Result<Vec3, string> {
  if (isDirectorSpeaker(speakerId)) {
    return ok(DIRECTOR_ORIGIN);
  }
  const orb = findOrb(orbs, speakerId);
  if (!orb.ok) return err(orb.error);
  return ok(orb.value.position);
}

export function speakerLabel(speakerId: string, orbs: SwarmOrb[]): string {
  if (isDirectorSpeaker(speakerId)) return "Director";
  const orb = findOrb(orbs, speakerId);
  return orb.ok ? orb.value.shortLabel : speakerId;
}

export function talkBeatKindLabel(kind: TalkBeatKind): string {
  switch (kind) {
    case "user-ask":
      return "ask";
    case "staff-reply":
      return "reply";
    case "staff-handoff":
      return "handoff";
    default: {
      const exhaustive: never = kind;
      throw new Error(`Unhandled talk beat: ${String(exhaustive)}`);
    }
  }
}

export function formatDirectedBeat(beat: TalkBeat, orbs: SwarmOrb[]): string {
  const from = speakerLabel(beat.fromId, orbs);
  const to = speakerLabel(beat.toId, orbs);
  return `${from} → ${to} (${talkBeatKindLabel(beat.kind)}): ${beat.text}`;
}

export function pairMatchesDirected(
  fromId: string,
  toId: string,
  a: string,
  b: string,
): boolean {
  return (fromId === a && toId === b) || (fromId === b && toId === a);
}

export async function planStaffRoomConversationWithAi(
  question: string,
  personas: Persona[] = PERSONAS,
): Promise<Result<TalkBeat[], string>> {
  const parsed = parseStaffQuestion(question);
  if (!parsed.ok) return parsed;

  const responders = selectResponders(parsed.value, personas);
  if (!responders.ok) return responders;

  const [primary, secondary] = responders.value;
  if (!primary) return err("Staff room is empty");

  const primaryBody = await generateStaffReply(primary, parsed.value);
  const primaryLetter = formatCampLetter(primary, parsed.value, primaryBody);

  const beats: TalkBeat[] = [
    {
      fromId: DIRECTOR_SPEAKER_ID,
      toId: primary.id,
      kind: "user-ask",
      text: parsed.value,
    },
    {
      fromId: primary.id,
      toId: DIRECTOR_SPEAKER_ID,
      kind: "staff-reply",
      text: clip(primaryBody, 160),
      letter: primaryLetter,
    },
  ];

  if (secondary) {
    const secondaryBody = await generateStaffReply(secondary, parsed.value);
    const secondaryLetter = formatCampLetter(secondary, parsed.value, secondaryBody);
    beats.push({
      fromId: primary.id,
      toId: secondary.id,
      kind: "staff-handoff",
      text: `${shortPersonaLabel(primary.title)} looping in ${shortPersonaLabel(secondary.title)} — ${secondary.traits[0] ?? secondary.title}.`,
    });
    beats.push({
      fromId: secondary.id,
      toId: DIRECTOR_SPEAKER_ID,
      kind: "staff-reply",
      text: clip(secondaryBody, 160),
      letter: secondaryLetter,
    });
  }

  return ok(beats);
}

function complementResponder(
  primary: Persona,
  personas: Persona[],
): Persona | undefined {
  const complementId =
    primary.id === FALLBACK_RESPONDERS[0]
      ? FALLBACK_RESPONDERS[1]
      : FALLBACK_RESPONDERS[0];
  const preferred = personas.find((persona) => persona.id === complementId);
  if (preferred && preferred.id !== primary.id) return preferred;
  return personas.find((persona) => persona.id !== primary.id);
}

function compactStaffReply(persona: Persona, question: string): string {
  const draft = buildDraftStaffReply(persona, question);
  const firstLine = draft
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return clip(firstLine ?? `${shortPersonaLabel(persona.title)} is on it.`, 160);
}

function draftLetterBody(persona: Persona, question: string): string {
  return buildDraftStaffReply(persona, question);
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
