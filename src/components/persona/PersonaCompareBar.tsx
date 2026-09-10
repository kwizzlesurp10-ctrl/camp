"use client";

import type { Persona } from "@/data/personas";
import { PersonaTag } from "@/components/persona/PersonaTag";
import { useViewTransition, TRANSITION_NAMES } from "@/lib/animations";

type PersonaCompareBarProps = {
  personas: Persona[];
  onClear: () => void;
  onRemove: (id: string) => void;
};

export function PersonaCompareBar({
  personas,
  onClear,
  onRemove,
}: PersonaCompareBarProps): React.ReactElement | null {
  const { startViewTransition } = useViewTransition();

  const handleRemove = (id: string) => {
    startViewTransition(() => onRemove(id));
  };

  const handleClear = () => {
    startViewTransition(() => onClear());
  };

  if (personas.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(96%,56rem)] px-4 animate-in slide-up-fade duration-300">
      <div className="rounded-2xl border border-amber-500/25 bg-zinc-900/97 backdrop-blur-xl shadow-2xl shadow-black/50 ring-1 ring-white/5 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
              {personas.length}
            </span>
            <p className="text-sm font-semibold text-amber-300 tracking-tight">
              Staff mix
            </p>
            <span className="text-xs text-zinc-400 font-mono">{personas.length}/3</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <CompareCard key={persona.id} persona={persona} onRemove={handleRemove} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareCard({
  persona,
  onRemove,
}: {
  persona: Persona;
  onRemove: (id: string) => void;
}): React.ReactElement {
  return (
    <div
      className="rounded-xl bg-zinc-800/60 border border-zinc-700/80 p-3.5 flex flex-col gap-2"
      style={{ viewTransitionName: `${TRANSITION_NAMES.personaCard}-${persona.id}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-100 leading-tight">{persona.title}</p>
        <button
          type="button"
          aria-label={`Remove ${persona.title} from comparison`}
          onClick={() => onRemove(persona.id)}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors text-sm font-medium"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {persona.tags.map((tag) => (
          <PersonaTag key={tag.label} label={tag.label} accent={tag.accent} />
        ))}
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
        {persona.essence}
      </p>

      <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-700/50">
        {persona.traits.map((trait) => (
          <span
            key={trait}
            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}
