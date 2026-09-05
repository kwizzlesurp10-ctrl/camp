"use client";

import Link from "next/link";
import { PERSONAS } from "@/data/personas";
import { CampSwarm } from "@/components/persona/CampSwarm";
import { PersonaDetailPanel } from "@/components/persona/PersonaDetailPanel";
import { usePersonaDeepLink } from "@/hooks/use-persona-deep-link";

export function CampSwarmApp(): React.ReactElement {
  const { selectedId, setSelectedId, toggleSelectedId, buildShareHref } =
    usePersonaDeepLink();
  const selectedPersona = PERSONAS.find((persona) => persona.id === selectedId) ?? null;

  return (
    <div className="relative min-h-dvh bg-[#000d1a] text-cyan-50">
      <Link
        href="/personas"
        className="absolute top-3 right-3 z-20 rounded-full border border-cyan-500/30 bg-[#000d1a]/70 px-3 py-1.5 text-[11px] tracking-wide text-cyan-200/80 hover:border-cyan-300/50 hover:text-cyan-50"
      >
        Persona archive
      </Link>
      <CampSwarm
        layout="stage"
        selectedId={selectedId}
        onSelectPersona={toggleSelectedId}
      />
      <PersonaDetailPanel
        persona={selectedPersona}
        onClose={() => setSelectedId(null)}
        shareHref={selectedPersona ? buildShareHref(selectedPersona.id) : undefined}
        printHref={
          selectedPersona ? `/training/print?persona=${selectedPersona.id}` : undefined
        }
      />
    </div>
  );
}
