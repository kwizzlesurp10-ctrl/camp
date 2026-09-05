"use client";

import { PERSONAS } from "@/data/personas";
import {
  buildCampSwarm,
  findOrb,
  projectSwarmToPlane,
  type SwarmLink,
} from "@/lib/camp-swarm";
import {
  DIRECTOR_ORIGIN,
  DIRECTOR_SPEAKER_ID,
  formatDirectedBeat,
  isDirectorSpeaker,
  speakerLabel,
  type TalkBeat,
} from "@/lib/camp-swarm-talk";

type CampSwarmFallbackProps = {
  selectedId: string | null;
  onSelectPersona: (id: string) => void;
  activeTalk: TalkBeat | null;
  showStatus?: boolean;
};

export function CampSwarmFallback({
  selectedId,
  onSelectPersona,
  activeTalk,
  showStatus = true,
}: CampSwarmFallbackProps): React.ReactElement {
  const swarm = buildCampSwarm(PERSONAS);
  const dock = projectSwarmToPlane(DIRECTOR_ORIGIN);
  const status = activeTalk
    ? formatDirectedBeat(activeTalk, swarm.orbs)
    : "Click any glowing counsellor — WebGL preview fell back to the lake map";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#000d1a]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {swarm.links.map((link) => {
          const line = linkPoints(link, swarm.orbs);
          if (!line) return null;
          const active =
            activeTalk !== null &&
            ((activeTalk.fromId === link.fromId && activeTalk.toId === link.toId) ||
              (activeTalk.fromId === link.toId && activeTalk.toId === link.fromId));
          return (
            <line
              key={`${link.fromId}-${link.toId}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={active ? "#c8ffff" : "#3ec8e0"}
              strokeOpacity={active ? 0.85 : link.kind === "cluster" ? 0.35 : 0.2}
              strokeWidth={active ? 0.7 : 0.28}
            />
          );
        })}
        {activeTalk ? <DirectedPulse talk={activeTalk} orbs={swarm.orbs} /> : null}
      </svg>

      <button
        type="button"
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ left: `${dock.x}%`, top: `${dock.y}%` }}
        aria-label="You, the director"
      >
        <span className="mx-auto block size-4 rounded-full bg-cyan-100 shadow-[0_0_18px_#9ef6ff]" />
        <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-cyan-100 uppercase">
          You
        </span>
      </button>

      {swarm.orbs.map((orb) => {
        const point = projectSwarmToPlane(orb.position);
        const selected = selectedId === orb.personaId;
        const speaking =
          activeTalk !== null &&
          (activeTalk.fromId === orb.personaId || activeTalk.toId === orb.personaId);
        return (
          <button
            key={orb.personaId}
            type="button"
            onClick={() => onSelectPersona(orb.personaId)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span
              className="mx-auto block rounded-full"
              style={{
                width: selected || speaking ? 22 : 16,
                height: selected || speaking ? 22 : 16,
                backgroundColor: orb.tone.css,
                boxShadow: `0 0 ${speaking ? 22 : 12}px ${orb.tone.css}`,
              }}
            />
            <span
              className="mt-1 block max-w-24 truncate text-[10px] font-semibold tracking-wide uppercase"
              style={{ color: orb.tone.css }}
            >
              {orb.shortLabel}
            </span>
          </button>
        );
      })}

      {showStatus ? (
        <p
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[min(36rem,calc(100%-1.5rem))] rounded-lg bg-cyan-400/15 px-3.5 py-2 text-xs text-cyan-200"
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}

function DirectedPulse({
  talk,
  orbs,
}: {
  talk: TalkBeat;
  orbs: ReturnType<typeof buildCampSwarm>["orbs"];
}): React.ReactElement | null {
  const from = speakerPoint(talk.fromId, orbs);
  const to = speakerPoint(talk.toId, orbs);
  if (!from || !to) return null;
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="#e7ffff"
      strokeOpacity={0.95}
      strokeWidth={0.9}
    >
      <title>{`${speakerLabel(talk.fromId, orbs)} → ${speakerLabel(talk.toId, orbs)}`}</title>
    </line>
  );
}

function speakerPoint(
  speakerId: string,
  orbs: ReturnType<typeof buildCampSwarm>["orbs"],
): { x: number; y: number } | null {
  if (isDirectorSpeaker(speakerId) || speakerId === DIRECTOR_SPEAKER_ID) {
    return projectSwarmToPlane(DIRECTOR_ORIGIN);
  }
  const orb = findOrb(orbs, speakerId);
  if (!orb.ok) return null;
  return projectSwarmToPlane(orb.value.position);
}

function linkPoints(
  link: SwarmLink,
  orbs: ReturnType<typeof buildCampSwarm>["orbs"],
): { x1: number; y1: number; x2: number; y2: number } | null {
  const from = findOrb(orbs, link.fromId);
  const to = findOrb(orbs, link.toId);
  if (!from.ok || !to.ok) return null;
  const a = projectSwarmToPlane(from.value.position);
  const b = projectSwarmToPlane(to.value.position);
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}
