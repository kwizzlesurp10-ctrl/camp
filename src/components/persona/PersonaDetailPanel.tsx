"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Persona } from "@/data/personas";
import { getClusterById } from "@/data/personas";
import { PersonaTag } from "@/components/persona/PersonaTag";
import { serializePersonaForAgents } from "@/lib/persona-export";
import { useViewTransition, TRANSITION_NAMES } from "@/lib/animations";
import { PersonaImageGenerator } from "@/components/persona/PersonaImageGenerator";

type PersonaDetailPanelProps = {
  persona: Persona | null;
  onClose: () => void;
  shareHref?: string;
  printHref?: string;
};

export function PersonaDetailPanel({
  persona,
  onClose,
  shareHref,
  printHref,
}: PersonaDetailPanelProps): React.ReactElement | null {
  const { startViewTransition } = useViewTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Simple loading state simulation (can be replaced with real async data later)
  const [isContentReady, setIsContentReady] = useState(false);

  // Store the element that had focus before the panel opened
  useEffect(() => {
    if (persona) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
      setIsContentReady(false);

      // Simulate content loading (remove this when real data fetching exists)
      const timer = setTimeout(() => setIsContentReady(true), 80);
      return () => clearTimeout(timer);
    }
  }, [persona]);

  // Focus management
  useEffect(() => {
    if (!persona) {
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
      return;
    }

    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    setTimeout(() => {
      if (focusable) {
        focusable.focus();
      } else {
        panelRef.current?.focus();
      }
    }, 60);
  }, [persona]);

  const handleClose = () => {
    startViewTransition(() => {
      onClose();
    });
  };

  if (!persona) return null;

  const cluster = getClusterById(persona.clusterId);

  return (
    <>
      <button
        type="button"
        aria-label="Close persona details"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 will-change-[opacity]"
        onClick={handleClose}
        style={{ viewTransitionName: TRANSITION_NAMES.personaBackdrop }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="persona-detail-title"
        tabIndex={-1}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 will-change-[transform]"
        style={{ viewTransitionName: TRANSITION_NAMES.personaPanel }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
          <p className="text-xs uppercase tracking-[2px] text-emerald-400 font-mono">
            {cluster?.label ?? persona.clusterId}
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-100 text-sm px-3 py-1 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            Close
          </button>
        </div>

        {!isContentReady ? (
          <PanelSkeleton />
        ) : (
          <DetailContent
            persona={persona}
            shareHref={shareHref}
            printHref={printHref}
          />
        )}
      </aside>
    </>
  );
}

function PanelSkeleton() {
  return (
    <div className="px-6 py-6 space-y-8 animate-pulse">
      <div className="h-8 w-3/4 bg-zinc-800 rounded" />
      <div className="h-4 w-1/4 bg-zinc-800 rounded" />
      <div className="space-y-3">
        <div className="h-4 bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-800 rounded w-5/6" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          <div className="h-16 bg-zinc-800 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          <div className="h-16 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}

function DetailContent({
  persona,
  shareHref,
  printHref,
}: {
  persona: Persona;
  shareHref?: string;
  printHref?: string;
}): React.ReactElement {
  async function copyAgentJson(): Promise<void> {
    await navigator.clipboard.writeText(serializePersonaForAgents(persona));
  }

  async function copyShareLink(): Promise<void> {
    if (!shareHref) return;
    await navigator.clipboard.writeText(shareHref);
  }

  return (
    <div className="px-6 py-6 space-y-8 pb-24">
      <header>
        <h2 id="persona-detail-title" className="text-3xl font-semibold tracking-tight">
          {persona.title}
        </h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">/{persona.id}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {persona.tags.map((tag) => (
            <PersonaTag key={tag.label} label={tag.label} accent={tag.accent} />
          ))}
        </div>
      </header>

      <PersonaImageGenerator personaId={persona.id} personaTitle={persona.title} />

      <DetailBlock label="Essence" body={persona.essence} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DetailBlock label="Motivations">
          <ul className="text-zinc-400 space-y-2 text-sm">
            {persona.motivations.map((item) => (
              <li key={item}>• {item}</li>
            ))}
        </ul>
        </DetailBlock>
        <DetailBlock label="Pain Points" body={persona.painPoints} />
      </div>
      <DetailBlock label="Teen Communication" body={persona.teenCommunication} />

      <div>
        <p className="text-xs uppercase tracking-[1.5px] text-zinc-500 mb-3">Traits</p>
        <div className="flex flex-wrap gap-2">
          {persona.traits.map((trait) => (
            <span
              key={trait}
              className="px-3 py-1 text-xs bg-zinc-800 rounded-full text-zinc-300"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => void copyAgentJson()}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors"
        >
          Copy agent JSON
        </button>
        {shareHref && (
          <button
            type="button"
            onClick={() => void copyShareLink()}
            className="w-full py-3 rounded-2xl border border-zinc-700 text-zinc-200 font-medium text-sm hover:border-zinc-500 transition-colors"
          >
            Copy deep link
          </button>
        )}
        {printHref && (
          <Link
            href={printHref}
            className="block w-full py-3 rounded-2xl border border-zinc-700 text-center text-zinc-200 font-medium text-sm hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
          >
            Open printable training sheet
          </Link>
        )}
        <a
          href={`/api/personas/${persona.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-2xl border border-zinc-800 text-center text-zinc-400 font-mono text-xs hover:text-zinc-200 transition-colors"
        >
          GET /api/personas/{persona.id}
        </a>
      </div>
    </div>
  );
}

function DetailBlock({
  label,
  body,
  children,
}: {
  label: string;
  body?: string;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      <p className="text-xs uppercase tracking-[1.5px] text-zinc-500 mb-2">{label}</p>
      {body ? <p className="text-zinc-300 text-sm leading-relaxed">{body}</p> : children}
    </div>
  );
}
