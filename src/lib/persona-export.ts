import type { Persona } from "@/data/personas";
import { getClusterById } from "@/data/personas";

export type AgentPersonaExport = {
  id: string;
  title: string;
  cluster: string;
  tags: string[];
  essence: string;
  motivations: string[];
  painPoints: string;
  teenCommunication: string;
  traits: string[];
};

export function toAgentExport(persona: Persona): AgentPersonaExport {
  const cluster = getClusterById(persona.clusterId);
  return {
    id: persona.id,
    title: persona.title,
    cluster: cluster?.label ?? persona.clusterId,
    tags: persona.tags.map((t) => t.label),
    essence: persona.essence,
    motivations: persona.motivations,
    painPoints: persona.painPoints,
    teenCommunication: persona.teenCommunication,
    traits: persona.traits,
  };
}

export function serializePersonaForAgents(persona: Persona): string {
  return JSON.stringify(toAgentExport(persona), null, 2);
}
