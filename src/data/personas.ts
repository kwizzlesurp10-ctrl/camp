export type PersonaClusterId =
  | "experience"
  | "motivation"
  | "engagement"
  | "domain";

export type Persona = {
  id: string;
  title: string;
  tags: { label: string; accent: string }[];
  essence: string;
  motivations: string[];
  painPoints: string;
  teenCommunication: string;
  traits: string[];
  clusterId: PersonaClusterId;
};

export type PersonaCluster = {
  id: PersonaClusterId;
  label: string;
  description: string;
};

export const PERSONA_CLUSTERS: PersonaCluster[] = [
  {
    id: "experience",
    label: "By Experience Level",
    description: "How many summers shape their instincts and authority.",
  },
  {
    id: "motivation",
    label: "By Primary Motivation",
    description: "What pulls them north when life could go elsewhere.",
  },
  {
    id: "engagement",
    label: "By Engagement Philosophy",
    description: "How they show up in the cabin, on the trail, at midnight.",
  },
  {
    id: "domain",
    label: "By Domain Mastery",
    description: "Specialized skills that keep bodies safe and spirits lit.",
  },
];

export const PERSONAS: Persona[] = [
  {
    id: "wide-eyed-rookie",
    title: "The Wide-Eyed Rookie",
    tags: [
      { label: "First Summer", accent: "emerald" },
      { label: "High Optimism", accent: "zinc" },
    ],
    essence:
      "Bright college student or recent grad stepping into their first northern summer. Armed with color-coded binders, zero blackfly tolerance, and an almost religious belief that “this will be the best summer ever.”",
    motivations: [
      "Prove they belong",
      "Make a real difference",
      "Build “camp family” instantly",
    ],
    painPoints:
      "Homesickness waves at 2am, constant teen testing, physical exhaustion, and the brutal gap between Pinterest camp and reality.",
    teenCommunication:
      "Over-questions, over-solves, then slowly learns the power of “I’m just here with you.”",
    traits: ["High Agency", "Needs Mentorship", "Future Legend"],
    clusterId: "experience",
  },
  {
    id: "seasoned-sentinel",
    title: "The Seasoned Sentinel",
    tags: [
      { label: "4–8 Summers", accent: "amber" },
      { label: "Steady Hand", accent: "zinc" },
    ],
    essence:
      "The calm center of the cabin. Has seen every flavor of drama, homesickness, and teenage existential crisis. Speaks softly and carries a well-worn flashlight and zero tolerance for bullshit.",
    motivations: [
      "Protect the magic",
      "Pass on the culture",
      "Keep the newbies alive",
    ],
    painPoints:
      "Repeating the same lessons every June. Watching promising rookies burn out. The quiet ache when favorite campers graduate.",
    teenCommunication:
      "Master of the “look” and the perfectly timed one-liner. Teens trust them because they never perform.",
    traits: ["Institutional Memory", "Trauma-Informed", "Quiet Authority"],
    clusterId: "experience",
  },
  {
    id: "northern-lifer",
    title: "The Northern Lifer",
    tags: [
      { label: "10+ Summers", accent: "sky" },
      { label: "Local or Legacy", accent: "zinc" },
    ],
    essence:
      "Part of the camp’s DNA. Either grew up nearby or has been coming since they were a camper. Knows every portage, every hidden swimming rock, and exactly which kid is about to spiral before they do.",
    motivations: [
      "Preserve the place",
      "Be the adult they needed",
      "Never fully leave",
    ],
    painPoints:
      "Watching “their” camp slowly change. The ache of seeing the woods they love slowly pressured by development or shrinking budgets.",
    teenCommunication:
      "Speaks in stories and local lore. Uses the land itself as the lesson. Teens listen because this person clearly belongs here more than anywhere else.",
    traits: ["Blackfly Immune", "Canoe Certified", "Living Archive"],
    clusterId: "experience",
  },
  {
    id: "impact-driven-mentor",
    title: "The Impact-Driven Mentor",
    tags: [
      { label: "Purpose First", accent: "violet" },
      { label: "Psych / Ed Background", accent: "zinc" },
    ],
    essence:
      "Sees every cabin chat, every failed canoe turn, and every homesick night as sacred developmental real estate. Often a future therapist, teacher, or outdoor educator.",
    motivations: [
      "Facilitate real growth",
      "Be the adult they needed",
      "Leave teens more whole",
    ],
    painPoints:
      "When the system prioritizes fun over depth. Watching teens return to toxic home environments. The limits of what two weeks can actually heal.",
    teenCommunication:
      "Master of reflective questions and “tell me more.” Creates safety so fast it almost feels like magic.",
    traits: ["Trauma-Informed", "Journal Keeper", "Long-game Thinker"],
    clusterId: "motivation",
  },
  {
    id: "adventure-escapee",
    title: "The Adventure Escapee",
    tags: [
      { label: "Off-Grid Reset", accent: "orange" },
      { label: "Between Chapters", accent: "zinc" },
    ],
    essence:
      "Using camp as a deliberate escape hatch from “real life.” Post-grad, post-breakup, post-burnout. Comes alive the moment cell service dies.",
    motivations: [
      "Live in their body again",
      "Remember who they are",
      "Outrun their thoughts",
    ],
    painPoints:
      "The end of summer crash. Returning to a life that now feels too small. The ache when the woods start to feel more like home than anywhere else.",
    teenCommunication:
      "Leads by example. “You don’t have to talk about it. Want to go split wood?” Teens feel the freedom radiating off them.",
    traits: ["Polar Plunge Ready", "Boundary Waters Soul", "Present-Moment Master"],
    clusterId: "motivation",
  },
  {
    id: "professional-developer",
    title: "The Professional Developer",
    tags: [
      { label: "Resume Builder", accent: "blue" },
      { label: "Future Director Track", accent: "zinc" },
    ],
    essence:
      "Treating the summer like a high-stakes internship in leadership, education, or outdoor recreation. Documents everything. Seeks feedback. Has a five-year plan that includes “Head Counselor → Camp Director.”",
    motivations: [
      "Build impressive stories",
      "Master hard skills",
      "Stand out on applications",
    ],
    painPoints:
      "When emotional labor doesn’t translate to résumé bullets. Feeling like they’re “performing” care instead of actually feeling it.",
    teenCommunication:
      "Structured and goal-oriented. Excellent at running meetings and activities. Still learning how to just “be” with a hurting kid.",
    traits: ["Highly Organized", "Feedback Hungry", "Systems Thinker"],
    clusterId: "motivation",
  },
  {
    id: "heart-centered-listener",
    title: "The Heart-Centered Listener",
    tags: [
      { label: "Emotional Anchor", accent: "rose" },
      { label: "Midnight Confidant", accent: "zinc" },
    ],
    essence:
      "The staff member teens find at 11:47pm when everything feels too big. Creates safety so quickly that kids who “never talk about feelings” suddenly open up.",
    motivations: [
      "Be a safe harbor",
      "Witness without fixing",
      "Help teens feel less alone",
    ],
    painPoints:
      "Carrying other people’s pain home. Secondary trauma. The ache when a camper leaves and you never get closure.",
    teenCommunication:
      "Almost supernatural ability to sit in silence. Uses “mmm” and “tell me more about that” like weapons of mass connection.",
    traits: ["Mental Health First Aid", "Non-Judgmental", "Deep Presence"],
    clusterId: "engagement",
  },
  {
    id: "energy-architect",
    title: "The Energy Architect",
    tags: [
      { label: "Hype Engine", accent: "yellow" },
      { label: "Song Leader", accent: "zinc" },
    ],
    essence:
      "The human defibrillator of camp. Can turn a rainy day cabin into a dance party in under four minutes. Protects morale like it’s a sacred duty.",
    motivations: [
      "Keep the joy alive",
      "Make every moment memorable",
      "Be the reason kids never want to leave",
    ],
    painPoints:
      "When their own energy crashes. Feeling like they have to perform even when they’re grieving or exhausted.",
    teenCommunication:
      "Uses volume, games, and ridiculous traditions as love languages. Teens feel chosen and celebrated.",
    traits: ["Infectious Joy", "Tradition Keeper", "Rain-Day Savior"],
    clusterId: "engagement",
  },
  {
    id: "boundary-guardian",
    title: "The Boundary Guardian",
    tags: [
      { label: "Fair but Firm", accent: "red" },
      { label: "Safety First", accent: "zinc" },
    ],
    essence:
      "The staff who can say “no” in a way that still makes teens feel respected. Master of holding structure without crushing spirit. Often the unsung hero of camp safety culture.",
    motivations: [
      "Keep everyone physically & emotionally safe",
      "Teach real accountability",
      "Protect the container",
    ],
    painPoints:
      "Being seen as “the mean one.” Watching other staff undermine rules for popularity. The exhaustion of constant vigilance.",
    teenCommunication:
      "Clear, calm, and consistent. Uses “I see you trying to negotiate and the answer is still no” with genuine warmth.",
    traits: ["Rule Enforcer", "Crisis Calm", "Respected (not always liked)"],
    clusterId: "engagement",
  },
  {
    id: "waterfront-sentinel",
    title: "The Waterfront Sentinel",
    tags: [
      { label: "Lifeguard Lead", accent: "cyan" },
      { label: "Lake Rat", accent: "zinc" },
    ],
    essence:
      "Lives and breathes the water. Obsessed with safety protocols but also turns every swim check and canoe lesson into a rite of passage. Reads both currents and teen body language with equal precision.",
    motivations: [
      "No one drowns on their watch",
      "Turn fear into confidence",
      "Make the lake feel like home",
    ],
    painPoints:
      "Parents who don’t respect water rules. Teens who think they’re stronger swimmers than they are. The constant low-level anxiety of being responsible for lives.",
    teenCommunication:
      "Direct, calm, and authoritative in the water. On land they’re often surprisingly gentle. “I’m not here to scare you. I’m here so you can be brave.”",
    traits: ["WSI Certified", "Water Reading Master", "Canoe Captain"],
    clusterId: "domain",
  },
  {
    id: "wilderness-steward",
    title: "The Wilderness Steward",
    tags: [
      { label: "Nature Educator", accent: "lime" },
      { label: "Leave No Trace", accent: "zinc" },
    ],
    essence:
      "Believes the forest is the real teacher. Leads hikes, orienteering, ecology sessions, and campfire storytelling with quiet reverence. Teaches teens how to listen to the land.",
    motivations: [
      "Foster ecological identity",
      "Slow teens down enough to notice",
      "Pass on land stewardship",
    ],
    painPoints:
      "Teens who stay glued to screens even in the woods. The grief of watching changing seasons and shrinking wild spaces.",
    teenCommunication:
      "Uses silence, wonder, and questions. “What do you notice right now?” is their most powerful tool.",
    traits: ["Ecological Literacy", "Storyteller of Place", "Patient Guide"],
    clusterId: "domain",
  },
  {
    id: "expressive-catalyst",
    title: "The Expressive Catalyst",
    tags: [
      { label: "Arts & Heart", accent: "fuchsia" },
      { label: "Talent Show Legend", accent: "zinc" },
    ],
    essence:
      "Runs arts, music, drama, zine-making, and late-night song circles. Creates the emotional and creative pressure-release valve for the entire camp. Often the person who helps the quietest or most anxious teens finally express themselves.",
    motivations: [
      "Give teens a voice",
      "Make the invisible visible",
      "Turn pain into art",
    ],
    painPoints:
      "When admin undervalues “soft” programming. Teens who are terrified of being seen. The vulnerability hangover after big creative nights.",
    teenCommunication:
      "Uses metaphor, music, and making. “You don’t have to explain it. Just show me in the song / drawing / scene.”",
    traits: ["Creative Facilitator", "Vulnerability Guide", "Culture Weaver"],
    clusterId: "domain",
  },
];

export function getClusterById(id: PersonaClusterId): PersonaCluster | undefined {
  return PERSONA_CLUSTERS.find((c) => c.id === id);
}

export function getPersonasByCluster(clusterId: PersonaClusterId): Persona[] {
  return PERSONAS.filter((p) => p.clusterId === clusterId);
}

export const PERSONA_IDS = PERSONAS.map((p) => p.id) as [
  string,
  ...string[],
];

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
