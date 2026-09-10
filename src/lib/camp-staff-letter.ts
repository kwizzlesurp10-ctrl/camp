import type { Persona } from "@/data/personas";
import { getClusterById } from "@/data/personas";
import { shortPersonaLabel } from "@/lib/camp-swarm";

export type CampLetter = {
  fromId: string;
  toId: string;
  letterhead: string;
  postmark: string;
  envelopeFrom: string;
  envelopeTo: string;
  salutation: string;
  body: string;
  closing: string;
  signature: string;
  ps?: string;
  rawQuestion: string;
};

const LETTERHEAD = "CAMP NORTHERN LIGHTS  ·  Staff Cabin Mail";

const POSTMARK_CUES = [
  "Friday after swim test",
  "Tuesday, blackfly season",
  "Wednesday before campfire",
  "Saturday morning canoe run",
  "Thursday after lights-out",
  "Sunday pancake breakfast",
  "Monday trail-clearing day",
] as const;

const CLOSINGS: Record<string, string> = {
  "wide-eyed-rookie": "Yours from the bunk with the colour-coded binders,",
  "seasoned-sentinel": "From the porch after lights-out,",
  "northern-lifer": "Still here on the lake,",
  "impact-driven-mentor": "With every ounce of belief,",
  "adventure-escapee": "Yours from the ridge,",
  "professional-developer": "Best from the office (the one with the canoe view),",
  "heart-centered-listener": "Holding space from Cabin Birch,",
  "energy-architect": "Full volume from the mess hall,",
  "boundary-guardian": "Clearly and with care,",
  "waterfront-sentinel": "Eyes on the water,",
  "wilderness-steward": "From the trail head,",
  "expressive-catalyst": "In song and colour,",
};

function pickPostmark(question: string): string {
  let hash = 0;
  for (let i = 0; i < question.length; i += 1) {
    hash = (hash * 31 + question.charCodeAt(i)) | 0;
  }
  return POSTMARK_CUES[Math.abs(hash) % POSTMARK_CUES.length] ?? POSTMARK_CUES[0];
}

function domainCue(persona: Persona): string {
  const cluster = getClusterById(persona.clusterId);
  const trait = persona.traits[0] ?? "";
  return cluster ? `${cluster.label.replace("By ", "")} · ${trait}` : trait;
}

export function formatCampLetter(
  persona: Persona,
  question: string,
  replyBody: string,
): CampLetter {
  const label = shortPersonaLabel(persona.title);
  return {
    fromId: persona.id,
    toId: "director",
    letterhead: LETTERHEAD,
    postmark: pickPostmark(question),
    envelopeFrom: `${label}  ·  ${persona.title}  ·  ${domainCue(persona)}`,
    envelopeTo: "The Director  ·  Staff Room Dock",
    salutation: "Dear Director,",
    body: replyBody,
    closing: CLOSINGS[persona.id] ?? "Yours from the lake,",
    signature: `${persona.title}\n— ${label}`,
    rawQuestion: question,
  };
}

export function renderCampLetterText(letter: CampLetter): string {
  const lines = [
    letter.letterhead,
    `Postmark: ${letter.postmark}`,
    "",
    `FROM: ${letter.envelopeFrom}`,
    `TO:   ${letter.envelopeTo}`,
    "",
    letter.salutation,
    "",
    letter.body,
    "",
    letter.closing,
    letter.signature,
  ];
  if (letter.ps) {
    lines.push("", `P.S. ${letter.ps}`);
  }
  return lines.join("\n");
}
