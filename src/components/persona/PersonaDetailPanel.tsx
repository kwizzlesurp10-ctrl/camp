"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Persona } from "@/data/personas";
import { getClusterById } from "@/data/personas";
import { PersonaTag } from "@/components/persona/PersonaTag";
import { serializePersonaForAgents } from "@/lib/persona-export";
import { useViewTransition, TRANSITION_NAMES } from "@/lib/animations";

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

  useEffect(() => {
    if (persona) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
    }
  }, [persona]);

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
            aria-label="Close panel"
            className="text-zinc-400 hover:text-zinc-100 text-sm px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        <DetailContent
          key={persona.id}
          persona={persona}
          shareHref={shareHref}
          printHref={printHref}
        />
      </aside>
    </>
  );
}

function PanelSkeleton(): React.ReactElement {
  return (
    <div className="px-6 py-6 space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-9 w-3/4 bg-zinc-800 rounded-lg" />
        <div className="h-3.5 w-24 bg-zinc-800 rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-zinc-800 rounded-full" />
          <div className="h-5 w-16 bg-zinc-800 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        <div className="h-4 bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-800 rounded w-4/5" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          <div className="h-4 bg-zinc-800 rounded" />
          <div className="h-4 bg-zinc-800 rounded w-4/5" />
          <div className="h-4 bg-zinc-800 rounded w-3/5" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          <div className="h-16 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-32 bg-zinc-800 rounded" />
        <div className="h-12 bg-zinc-800 rounded" />
      </div>
      <div className="space-y-2 pt-4">
        <div className="h-11 bg-zinc-800 rounded-2xl" />
        <div className="h-11 bg-zinc-800 rounded-2xl" />
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
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState<"json" | "link" | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 80);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return <PanelSkeleton />;

  function flash(which: "json" | "link"): void {
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyAgentJson(): Promise<void> {
    await navigator.clipboard.writeText(serializePersonaForAgents(persona));
    flash("json");
  }

  async function copyShareLink(): Promise<void> {
    if (!shareHref) return;
    await navigator.clipboard.writeText(shareHref);
    flash("link");
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

      <DetailBlock label="Essence" body={persona.essence} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DetailBlock label="Motivations">
          <ul className="space-y-2 mt-1">
            {persona.motivations.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-0.5 text-emerald-500 shrink-0">›</span>
                <span>{item}</span>
              </li>
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
              className="px-3 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 font-medium"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2 pt-2 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => void copyAgentJson()}
          disabled={copied === "json"}
          className={[
            "w-full py-3 rounded-2xl font-medium text-sm transition-all duration-200",
            copied === "json"
              ? "bg-emerald-700/80 text-emerald-200 cursor-default"
              : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white",
          ].join(" ")}
        >
          {copied === "json" ? "Copied ✓" : "Copy agent JSON"}
        </button>

        {shareHref && (
          <button
            type="button"
            onClick={() => void copyShareLink()}
            disabled={copied === "link"}
            className={[
              "w-full py-3 rounded-2xl border font-medium text-sm transition-all duration-200",
              copied === "link"
                ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5 cursor-default"
                : "border-zinc-700 text-zinc-200 hover:border-zinc-500 active:scale-[0.98]",
            ].join(" ")}
          >
            {copied === "link" ? "Link copied ✓" : "Copy deep link"}
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
          className="block w-full py-2.5 rounded-2xl border border-zinc-800 text-center text-zinc-500 font-mono text-xs hover:text-zinc-300 hover:border-zinc-700 transition-colors"
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
