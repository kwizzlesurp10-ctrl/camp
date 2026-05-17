"use client";

import type { Persona } from "@/data/personas";

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
  if (personas.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(100%,42rem)] px-4">
      <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-amber-500/10 p-4">
        <CompareHeader personas={personas} onClear={onClear} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <CompareCard key={persona.id} persona={persona} onRemove={onRemove} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareHeader({
  personas,
  onClear,
}: {
  personas: Persona[];
  onClear: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-sm font-medium text-amber-400">
        Staff mix ({personas.length}/3)
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        Clear
      </button>
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
    <div className="rounded-xl bg-zinc-800/80 p-3 border border-zinc-700 relative">
      <button
        type="button"
        aria-label={`Remove ${persona.title}`}
        onClick={() => onRemove(persona.id)}
        className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-200 text-xs"
      >
        ×
      </button>
      <p className="text-sm font-semibold pr-4">{persona.title}</p>
      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{persona.essence}</p>
      <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-wider">
        {persona.traits[0]}
      </p>
    </div>
  );
}
