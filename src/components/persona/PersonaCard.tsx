"use client";

import type { Persona } from "@/data/personas";
import { PersonaTag } from "@/components/persona/PersonaTag";
import { useViewTransition, TRANSITION_NAMES } from "@/lib/animations";

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
        "persona-node group bg-zinc-900 border rounded-3xl p-6 flex flex-col cursor-pointer transition-all duration-300",
        "hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5",
        isSelected
          ? "border-emerald-500/60 ring-2 ring-emerald-500/20"
          : "border-zinc-800",
        isCompared ? "outline outline-2 outline-amber-500/40 outline-offset-2" : "",
      ].join(" ")}
      style={{ viewTransitionName: TRANSITION_NAMES.personaCard }}
    >
      <header className="persona-header">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
          {persona.title}
        </h3>
        <PersonaTagList persona={persona} />
      </header>

      <CardBody persona={persona} />

      <footer className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-[10px]">
          {persona.traits.slice(0, 2).map((trait) => (
            <span key={trait} className="px-2.5 py-px bg-zinc-800 rounded text-zinc-400">
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
            "text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors shrink-0",
            isCompared
              ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
            : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300",
          ].join(" ")}
          aria-pressed={isCompared}
        >
          {isCompared ? "In mix" : "Compare"}
        </button>
      </footer>
    </article>
  );
}

function CardBody({ persona }: { persona: Persona }): React.ReactElement {
  return (
    <div className="persona-body flex-1 space-y-4 text-sm mt-4">
      <Field label="Essence">
        <p className="text-zinc-300 line-clamp-3 group-hover:line-clamp-none transition-all">
          {persona.essence}
        </p>
      </Field>
      <Field label="Teen Communication">
        <p className="text-xs text-zinc-400 italic line-clamp-2">
          {persona.teenCommunication}
        </p>
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      <p className="text-xs uppercase tracking-[1.5px] text-zinc-500 mb-1">{label}</p>
      {children}
    </div>
  );
}

function PersonaTagList({ persona }: { persona: Persona }): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {persona.tags.map((tag) => (
        <PersonaTag key={tag.label} label={tag.label} accent={tag.accent} />
      ))}
    </div>
  );
}
