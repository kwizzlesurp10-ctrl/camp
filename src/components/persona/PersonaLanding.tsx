"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PERSONA_CLUSTERS,
  PERSONAS,
  getPersonaById,
  type Persona,
  type PersonaClusterId,
} from "@/data/personas";
import { CampSwarm } from "@/components/persona/CampSwarm";
import { PersonaCard } from "@/components/persona/PersonaCard";
import { PersonaCompareBar } from "@/components/persona/PersonaCompareBar";
import { PersonaDetailPanel } from "@/components/persona/PersonaDetailPanel";
import { usePersonaDeepLink } from "@/hooks/use-persona-deep-link";
import {
  filterPersonas,
  getAllTraits,
  type PersonaFilterState,
} from "@/lib/persona-filters";

const MAX_COMPARE = 3;

const INITIAL_FILTER: PersonaFilterState = {
  query: "",
  clusterId: "all",
  trait: null,
};

export function PersonaLanding(): React.ReactElement {
  const { selectedId, setSelectedId, toggleSelectedId, buildShareHref } =
    usePersonaDeepLink();
  const [filter, setFilter] = useState<PersonaFilterState>(INITIAL_FILTER);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [openClusters, setOpenClusters] = useState<Record<PersonaClusterId, boolean>>({
    experience: true,
    motivation: false,
    engagement: false,
    domain: false,
  });
  const [clusterOpenedForSelectedId, setClusterOpenedForSelectedId] = useState<string | null>(null);

  if (selectedId !== clusterOpenedForSelectedId) {
    setClusterOpenedForSelectedId(selectedId);
    if (selectedId) {
      const persona = getPersonaById(selectedId);
      if (persona) {
        setOpenClusters((prev) => {
          if (prev[persona.clusterId]) return prev;
          return { ...prev, [persona.clusterId]: true };
        });
      }
    }
  }

  const filtered = useMemo(() => filterPersonas(PERSONAS, filter), [filter]);
  const traits = useMemo(() => getAllTraits(), []);

  const selectedPersona = useMemo(
    () => PERSONAS.find((p) => p.id === selectedId) ?? null,
    [selectedId],
  );

  const comparePersonas = useMemo(
    () =>
      compareIds
        .map((id) => PERSONAS.find((p) => p.id === id))
        .filter((p): p is Persona => Boolean(p)),
    [compareIds],
  );

  useEffect(() => {
    if (!selectedId) return;
    document
      .querySelector(`[data-persona-id="${selectedId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedId]);

  const handleToggleCompare = useCallback((id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, id];
    });
  }, []);

  const scrollToCluster = useCallback((clusterId: PersonaClusterId) => {
    setOpenClusters((prev) => ({ ...prev, [clusterId]: true }));
    setFilter((prev) => ({ ...prev, clusterId }));
    document.getElementById(`cluster-${clusterId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-cyan-600/5 blur-3xl" />
      </div>

      <section
        id="persona-dom-tree"
        className="relative max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14"
      >
        <header className="mb-10 border-b border-zinc-800 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <span className="text-3xl" aria-hidden>
                🌲
              </span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tighter">
                Northern Teenage Summer Camp Staff
              </h1>
              <p className="text-emerald-400 text-xs sm:text-sm tracking-[3px] font-medium mt-1">
                THE NORTH WOODS • LAKE LIFE • TEEN TRANSFORMATION
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-base sm:text-lg text-zinc-400 mb-6">
            A living map of the archetypes who keep the fire burning, the canoes upright, and the
            teenagers seen. The cyan swarm is the staff-room: twelve agents talking. Explore,
            compare mixes, and export personas for simulations.
          </p>
          <nav className="flex flex-wrap gap-3 mb-6" aria-label="Training resources">
            <Link
              href="/training/print"
              className="text-sm px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
            >
              Printable training guide
            </Link>
            <a
              href="/api/personas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors font-mono"
            >
              GET /api/personas
            </a>
          </nav>
          <div className="flex flex-wrap gap-3">
            <StatPill label="Archetypes" value="12" />
            <StatPill label="Clusters" value="4" />
            <StatPill label="Visible now" value={String(filtered.length)} accent />
          </div>
        </header>

        <CampSwarm selectedId={selectedId} onSelectPersona={toggleSelectedId} />

        <div className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 mb-8 bg-zinc-950/80 backdrop-blur-xl border-y border-zinc-800/80">
          <div className="flex flex-col gap-4">
            <input
              type="search"
              placeholder="Search essence, traits, pain points…"
              value={filter.query}
              onChange={(event) =>
                setFilter({ ...filter, query: event.target.value })
              }
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={filter.clusterId === "all"}
                onClick={() => setFilter({ ...filter, clusterId: "all" })}
              >
                All clusters
              </FilterChip>
              {PERSONA_CLUSTERS.map((cluster) => (
                <FilterChip
                  key={cluster.id}
                  active={filter.clusterId === cluster.id}
                  onClick={() => {
                    setFilter({ ...filter, clusterId: cluster.id });
                    scrollToCluster(cluster.id);
                  }}
                >
                  {cluster.label.replace("By ", "")}
                </FilterChip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              <FilterChip
                active={filter.trait === null}
                onClick={() => setFilter({ ...filter, trait: null })}
              >
                All traits
              </FilterChip>
              {traits.map((trait) => (
                <FilterChip
                  key={trait}
                  active={filter.trait === trait}
                  onClick={() =>
                    setFilter({
                      ...filter,
                      trait: filter.trait === trait ? null : trait,
                    })
                  }
                >
                  {trait}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mb-6">
          Showing {filtered.length} of {PERSONAS.length} archetypes
          {filter.query ? ` matching "${filter.query}"` : ""}
        </p>

        <div className="category-root space-y-6">
          {PERSONA_CLUSTERS.map((cluster) => {
            const clusterPersonas = filtered.filter((p) => p.clusterId === cluster.id);
            if (clusterPersonas.length === 0 && filter.clusterId !== cluster.id) {
              return null;
            }
            const isOpen = openClusters[cluster.id];
            return (
              <details
                key={cluster.id}
                id={`cluster-${cluster.id}`}
                open={isOpen}
                className="cluster border border-zinc-800 rounded-3xl overflow-hidden scroll-mt-28"
              >
                <summary
                  className="px-6 sm:px-8 py-5 bg-zinc-900 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors text-lg sm:text-xl font-semibold list-none [&::-webkit-details-marker]:hidden"
                  onClick={(event) => {
                    event.preventDefault();
                    setOpenClusters((prev) => ({
                      ...prev,
                      [cluster.id]: !prev[cluster.id],
                    }));
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span>{cluster.label}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 font-mono tracking-widest">
                      {clusterPersonas.length} SHOWN
                    </span>
                  </div>
                  <span className="text-emerald-400 text-sm">{isOpen ? "▾" : "▸"}</span>
                </summary>
                <div className="px-6 sm:px-8 pb-8 pt-2">
                  <p className="text-sm text-zinc-500 mb-6">{cluster.description}</p>
                  {clusterPersonas.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl" aria-hidden>
                        🔍
                      </div>
                      <p className="text-zinc-500 text-sm">No archetypes match your filters in this cluster.</p>
                      <button
                        type="button"
                        onClick={() => setFilter(INITIAL_FILTER)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {clusterPersonas.map((persona) => (
                        <PersonaCard
                          key={persona.id}
                          persona={persona}
                          isSelected={selectedId === persona.id}
                          isCompared={compareIds.includes(persona.id)}
                          onSelect={toggleSelectedId}
                          onToggleCompare={handleToggleCompare}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>

        <footer className="mt-12 pt-8 border-t border-zinc-800 text-xs text-zinc-500 flex flex-col md:flex-row md:items-center gap-y-2 justify-between">
          <div>
            Generated for staff training, agentic simulations, UI/UX prototyping, and
            multi-agent orchestration.
            <br />
            Optimized for LangGraph, CrewAI, AutoGen, and custom camp management systems.
          </div>
          <div className="font-mono tracking-widest">NORTHERN • TEEN • SUMMER • 2026</div>
        </footer>
      </section>

      <PersonaDetailPanel
        persona={selectedPersona}
        onClose={() => setSelectedId(null)}
        shareHref={selectedPersona ? buildShareHref(selectedPersona.id) : undefined}
        printHref={
          selectedPersona ? `/training/print?persona=${selectedPersona.id}` : undefined
        }
      />
      <PersonaCompareBar
        personas={comparePersonas}
        onClear={() => setCompareIds([])}
        onRemove={(id) => setCompareIds((ids) => ids.filter((item) => item !== id))}
      />
    </div>
  );
}

function StatPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}): React.ReactElement {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3 min-w-[7rem]",
        accent ? "border-emerald-500/30 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/50",
      ].join(" ")}
    >
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`text-2xl font-semibold ${accent ? "text-emerald-400" : "text-zinc-100"}`}>
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-xs px-3 py-1.5 rounded-full border transition-colors",
        active
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
