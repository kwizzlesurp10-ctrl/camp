"use client";

import dynamic from "next/dynamic";
import { PERSONA_CLUSTERS } from "@/data/personas";
import { buildCampSwarm } from "@/lib/camp-swarm";

const CampSwarmCanvas = dynamic(
  () => import("./CampSwarmCanvas").then((mod) => mod.CampSwarmCanvas),
  {
    ssr: false,
    loading: () => <SwarmStageSkeleton />,
  },
);

type CampSwarmProps = {
  selectedId: string | null;
  onSelectPersona: (id: string) => void;
};

export function CampSwarm({
  selectedId,
  onSelectPersona,
}: CampSwarmProps): React.ReactElement {
  const swarm = buildCampSwarm();

  return (
    <section
      aria-label="Camp agent constellation"
      className="mb-10 overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#000d1a]"
    >
      <header className="flex flex-col gap-2 border-b border-cyan-500/15 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] font-medium tracking-[0.28em] text-cyan-400/80 uppercase">
            Bio-swarm · staff room
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-cyan-50 sm:text-xl">
            Twelve counsellors, one cyan spectrum
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-cyan-100/60">
            Each orb is a camp personality. Tendrils are how the agents talk — cluster
            mates stay close; staff-room links cross the lake.
          </p>
        </div>
        <p className="text-xs text-cyan-300/70">
          Drag to orbit · click an orb to open the persona
        </p>
      </header>

      <div className="relative h-[28rem] sm:h-[32rem]">
        <CampSwarmCanvas selectedId={selectedId} onSelectPersona={onSelectPersona} />
      </div>

      <ul className="grid grid-cols-2 gap-2 border-t border-cyan-500/15 px-5 py-4 sm:grid-cols-3 lg:grid-cols-4 sm:px-6">
        {swarm.orbs.map((orb) => {
          const cluster = PERSONA_CLUSTERS.find((item) => item.id === orb.clusterId);
          const isSelected = selectedId === orb.personaId;
          return (
            <li key={orb.personaId}>
              <button
                type="button"
                onClick={() => onSelectPersona(orb.personaId)}
                className={[
                  "flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors",
                  isSelected
                    ? "border-cyan-300/50 bg-cyan-400/10"
                    : "border-transparent hover:border-cyan-500/30 hover:bg-cyan-400/5",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: orb.tone.css, boxShadow: `0 0 10px ${orb.tone.css}` }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-cyan-50">
                    {orb.shortLabel}
                  </span>
                  <span className="block truncate text-[10px] uppercase tracking-wider text-cyan-300/50">
                    {cluster?.label.replace("By ", "") ?? orb.clusterId}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SwarmStageSkeleton(): React.ReactElement {
  return (
    <div className="flex h-full items-center justify-center bg-[#000d1a]">
      <p className="text-sm tracking-wide text-cyan-300/70">Lighting the lake…</p>
    </div>
  );
}
