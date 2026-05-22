"use client";

import type { Persona } from "@/data/personas";
import { PersonaTag } from "@/components/persona/PersonaTag";
import { useViewTransition, TRANSITION_NAMES } from "@/lib/animations";

// Full class strings required so Tailwind can scan them statically.
const ACCENT_HOVER: Record<string, string> = {
  emerald: "hover:border-emerald-500/40",
  amber:   "hover:border-amber-500/40",
  sky:     "hover:border-sky-500/40",
  violet:  "hover:border-violet-500/40",
  orange:  "hover:border-orange-500/40",
  blue:    "hover:border-blue-500/40",
  rose:    "hover:border-rose-500/40",
  yellow:  "hover:border-yellow-500/40",
  red:     "hover:border-red-500/40",
  cyan:    "hover:border-cyan-500/40",
  lime:    "hover:border-lime-500/40",
  fuchsia: "hover:border-fuchsia-500/40",
  zinc:    "hover:border-zinc-500/40",
};

const ACCENT_SELECTED: Record<string, string> = {
  emerald: "border-emerald-500/60 ring-2 ring-emerald-500/20",
  amber:   "border-amber-500/60 ring-2 ring-amber-500/20",
  sky:     "border-sky-500/60 ring-2 ring-sky-500/20",
  violet:  "border-violet-500/60 ring-2 ring-violet-500/20",
  orange:  "border-orange-500/60 ring-2 ring-orange-500/20",
  blue:    "border-blue-500/60 ring-2 ring-blue-500/20",
  rose:    "border-rose-500/60 ring-2 ring-rose-500/20",
  yellow:  "border-yellow-500/60 ring-2 ring-yellow-500/20",
  red:     "border-red-500/60 ring-2 ring-red-500/20",
  cyan:    "border-cyan-500/60 ring-2 ring-cyan-500/20",
  lime:    "border-lime-500/60 ring-2 ring-lime-500/20",
  fuchsia: "border-fuchsia-500/60 ring-2 ring-fuchsia-500/20",
  zinc:    "border-zinc-500/60 ring-2 ring-zinc-500/20",
};

type PersonaCardProps = {
  persona: Persona;
  isSelected: boolean;
  isCompared: boolean;
  onSelect: (id: string) => void;
  onToggleCompare: (id: string) => void;
};

export function PersonaCard({
  persona,
  isSelected,
  isCompared,
  onSelect,
  onToggleCompare,
}: PersonaCardProps): React.ReactElement {
  const { startViewTransition } = useViewTransition();
  const primaryAccent = persona.tags[0]?.accent ?? "zinc";
  const hoverClass    = ACCENT_HOVER[primaryAccent]    ?? ACCENT_HOVER.zinc;
  const selectedClass = ACCENT_SELECTED[primaryAccent] ?? ACCENT_SELECTED.zinc;

  const handleSelect = () => {
    startViewTransition(() => {
      onSelect(persona.id);
    });
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      data-persona-id={persona.id}
      className={[
        "persona-node group relative bg-zinc-900 border rounded-3xl p-6 flex flex-col cursor-pointer",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30",
        "animate-in slide-up duration-300",
        hoverClass,
        isSelected ? selectedClass : "border-zinc-800",
        isCompared ? "outline outline-2 outline-amber-500/40 outline-offset-2" : "",
      ].join(" ")}
      style={{ viewTransitionName: TRANSITION_NAMES.personaCard }}
    >
      <header>
        <h3 className="text-lg font-semibold tracking-tight text-zinc-100 leading-snug">
          {persona.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {persona.tags.map((tag) => (
            <PersonaTag key={tag.label} label={tag.label} accent={tag.accent} />
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-3 text-sm mt-4">
        <div>
          <p className="text-[10px] uppercase tracking-[1.5px] text-zinc-500 mb-1">Essence</p>
          <p className="text-zinc-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none">
            {persona.essence}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[1.5px] text-zinc-500 mb-1">Teen Communication</p>
          <p className="text-xs text-zinc-400 italic line-clamp-2">
            {persona.teenCommunication}
          </p>
        </div>
      </div>

      <footer className="mt-auto pt-4 border-t border-zinc-800/80 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {persona.traits.map((trait) => (
            <span
              key={trait}
              className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400 font-medium"
            >
              {trait}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleCompare(persona.id);
          }}
          className={[
            "text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all duration-200 shrink-0 font-semibold",
            isCompared
              ? "border-amber-500/60 text-amber-300 bg-amber-500/15 hover:bg-amber-500/25"
              : "border-zinc-700 text-zinc-500 hover:border-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
          ].join(" ")}
          aria-pressed={isCompared}
        >
          {isCompared ? "✓ In mix" : "+ Compare"}
        </button>
      </footer>
    </article>
  );
}
