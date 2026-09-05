"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useTransition } from "react";
import { askStaffRoom } from "@/app/actions/staff-room";
import { PERSONA_CLUSTERS } from "@/data/personas";
import { buildCampSwarm } from "@/lib/camp-swarm";
import { formatDirectedBeat, type TalkBeat } from "@/lib/camp-swarm-talk";

const CampSwarmCanvas = dynamic(
  () => import("./CampSwarmCanvas").then((mod) => mod.CampSwarmCanvas),
  {
    ssr: false,
    loading: () => <SwarmStageSkeleton />,
  },
);

const BEAT_HOLD_MS = 3200;

const SUGGESTED_QUESTIONS = [
  "Homesick camper crying at midnight",
  "Kid wants to skip the swim test",
  "Rainy day and morale is in the dirt",
] as const;

type CampSwarmProps = {
  selectedId: string | null;
  onSelectPersona: (id: string) => void;
};

export function CampSwarm({
  selectedId,
  onSelectPersona,
}: CampSwarmProps): React.ReactElement {
  const swarm = buildCampSwarm();
  const [question, setQuestion] = useState("");
  const [beats, setBeats] = useState<TalkBeat[]>([]);
  const [beatIndex, setBeatIndex] = useState(0);
  const [askError, setAskError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeTalk = beatIndex < beats.length ? (beats[beatIndex] ?? null) : null;

  useEffect(() => {
    if (beats.length === 0 || beatIndex >= beats.length) return undefined;
    const timer = window.setTimeout(() => {
      setBeatIndex((current) => current + 1);
    }, BEAT_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [beats, beatIndex]);

  const submitQuestion = (value: string): void => {
    startTransition(async () => {
      const result = await askStaffRoom(value);
      if (!result.ok) {
        setAskError(result.error);
        return;
      }
      setAskError(null);
      setQuestion(value);
      setBeats(result.value);
      setBeatIndex(0);
    });
  };

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
            Each orb is a camp personality. Ask the dock and watch the live pulse
            travel in the direction of the reply — staff to staff, or staff to you.
          </p>
        </div>
        <p className="text-xs text-cyan-300/70">
          Drag to orbit · click an orb to open the persona
        </p>
      </header>

      <div className="relative h-[28rem] sm:h-[32rem]">
        <CampSwarmCanvas
          selectedId={selectedId}
          onSelectPersona={onSelectPersona}
          activeTalk={activeTalk}
        />
      </div>

      <form
        className="flex flex-col gap-3 border-t border-cyan-500/15 px-5 py-4 sm:px-6"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuestion(question);
        }}
      >
        <label htmlFor="staff-room-question" className="text-xs text-cyan-300/70">
          Ask the staff room
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="staff-room-question"
            type="text"
            value={question}
            maxLength={280}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Homesick camper, swim test, rainy-day mutiny…"
            className="w-full rounded-xl border border-cyan-500/25 bg-cyan-950/40 px-3 py-2.5 text-sm text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-medium text-cyan-950 transition-colors hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? "Calling staff…" : "Ask"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => submitQuestion(suggestion)}
              className="rounded-full border border-cyan-500/20 px-3 py-1 text-[11px] text-cyan-200/80 hover:border-cyan-300/40 hover:text-cyan-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        {askError ? (
          <p role="alert" className="text-xs text-rose-300">
            {askError}
          </p>
        ) : null}
        {activeTalk ? (
          <p className="text-xs leading-relaxed text-cyan-100/80">
            {formatDirectedBeat(activeTalk, swarm.orbs)}
          </p>
        ) : (
          <p className="text-xs text-cyan-300/50">
            Ambient staff-room chatter until you ask a question.
          </p>
        )}
      </form>

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
