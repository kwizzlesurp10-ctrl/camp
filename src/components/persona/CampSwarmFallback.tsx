"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { PERSONAS } from "@/data/personas";
import {
  ACTIVE_TONE,
  buildCampSwarm,
  findOrb,
  projectSwarmToPlane,
  type SwarmLink,
  type SwarmOrb,
  type Vec3,
} from "@/lib/camp-swarm";
import {
  dragDidMove,
  placeOrbFromPlane,
  resolveOrbPlane,
  type OrbPlacements,
} from "@/lib/camp-swarm-placement";
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
  placements?: OrbPlacements;
  onPlaceOrb?: (personaId: string, position: Vec3) => void;
  isThinking?: boolean;
};

type DragSession = {
  personaId: string;
  startClientX: number;
  startClientY: number;
  moved: boolean;
};

export function CampSwarmFallback({
  selectedId,
  onSelectPersona,
  activeTalk,
  showStatus = true,
  placements = {},
  onPlaceOrb,
  isThinking = false,
}: CampSwarmFallbackProps): React.ReactElement {
  const swarm = buildCampSwarm(PERSONAS);
  const stageRef = useRef<HTMLDivElement>(null);
  const placementsRef = useRef(placements);
  const onPlaceOrbRef = useRef(onPlaceOrb);
  const dragRef = useRef<DragSession | null>(null);
  const skipClickRef = useRef(false);
  const [drag, setDrag] = useState<DragSession | null>(null);

  useEffect(() => {
    placementsRef.current = placements;
    onPlaceOrbRef.current = onPlaceOrb;
  }, [onPlaceOrb, placements]);

  const dock = projectSwarmToPlane(DIRECTOR_ORIGIN);
  const status = activeTalk
    ? formatDirectedBeat(activeTalk, swarm.orbs)
    : "Drag orbs to rearrange · click one to open the persona";

  const moveOrb = (personaId: string, clientX: number, clientY: number): void => {
    const stage = stageRef.current;
    const place = onPlaceOrbRef.current;
    const orb = swarm.orbs.find((item) => item.personaId === personaId);
    if (!stage || !orb || !place) return;
    const bounds = stage.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    const plane = {
      x: ((clientX - bounds.left) / bounds.width) * 100,
      y: ((clientY - bounds.top) / bounds.height) * 100,
    };
    place(personaId, placeOrbFromPlane(orb, plane, placementsRef.current));
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>): void => {
    const session = dragRef.current;
    if (!session || session.personaId !== event.currentTarget.dataset.swarmOrbId) return;
    if (session.moved) {
      skipClickRef.current = true;
      moveOrb(session.personaId, event.clientX, event.clientY);
    }
    dragRef.current = null;
    setDrag(null);
  };

  return (
    <div
      ref={stageRef}
      className="relative h-full w-full touch-none overflow-hidden bg-[#000d1a] select-none"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {swarm.links.map((link) => {
          const line = linkPoints(link, swarm.orbs, placements);
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
        {activeTalk ? (
          <DirectedPulse talk={activeTalk} orbs={swarm.orbs} placements={placements} />
        ) : null}
      </svg>

      <div
        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ left: `${dock.x}%`, top: `${dock.y}%` }}
        aria-label="You, the director"
      >
        <span className="mx-auto block size-4 rounded-full bg-cyan-100 shadow-[0_0_18px_#9ef6ff]" />
        <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-cyan-100 uppercase">
          You
        </span>
      </div>

      {swarm.orbs.map((orb) => {
        const point = resolveOrbPlane(orb, placements);
        const selected = selectedId === orb.personaId;
        const speaking =
          activeTalk !== null &&
          (activeTalk.fromId === orb.personaId || activeTalk.toId === orb.personaId);
        const thinking = isThinking && !speaking;
        return (
          <button
            key={orb.personaId}
            type="button"
            data-swarm-orb-id={orb.personaId}
            aria-label={`Drag ${orb.title} to rearrange, or click to open`}
            aria-grabbed={drag?.personaId === orb.personaId}
            className={[
              "absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none text-center active:cursor-grabbing",
              drag?.personaId === orb.personaId ? "z-20" : "z-10",
            ].join(" ")}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onPointerDown={(event) => {
              if (!onPlaceOrbRef.current) return;
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              const session = {
                personaId: orb.personaId,
                startClientX: event.clientX,
                startClientY: event.clientY,
                moved: false,
              };
              dragRef.current = session;
              setDrag(session);
            }}
            onPointerMove={(event) => {
              const session = dragRef.current;
              if (!session || session.personaId !== orb.personaId) return;
              if (
                !session.moved &&
                dragDidMove(session.startClientX, session.startClientY, event.clientX, event.clientY)
              ) {
                session.moved = true;
                setDrag({ ...session });
              }
              if (session.moved) {
                moveOrb(orb.personaId, event.clientX, event.clientY);
              }
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={() => {
              if (skipClickRef.current) {
                skipClickRef.current = false;
                return;
              }
              onSelectPersona(orb.personaId);
            }}
          >
            <span
              className={["mx-auto block rounded-full", thinking ? "animate-pulse" : ""].join(" ")}
              style={{
                width: selected || speaking ? 22 : thinking ? 18 : 16,
                height: selected || speaking ? 22 : thinking ? 18 : 16,
                backgroundColor: speaking ? ACTIVE_TONE.css : thinking ? ACTIVE_TONE.css : orb.tone.css,
                boxShadow: `0 0 ${speaking ? 26 : thinking ? 18 : 12}px ${speaking || thinking ? ACTIVE_TONE.css : orb.tone.css}`,
                opacity: thinking ? 0.7 : 1,
                transition: "background-color 0.4s, box-shadow 0.4s, opacity 0.4s, width 0.3s, height 0.3s",
              }}
            />
            <span
              className="mt-1 block max-w-24 truncate text-[10px] font-semibold tracking-wide uppercase"
              style={{ color: speaking || thinking ? ACTIVE_TONE.css : orb.tone.css, transition: "color 0.4s" }}
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
  placements,
}: {
  talk: TalkBeat;
  orbs: SwarmOrb[];
  placements: OrbPlacements;
}): React.ReactElement | null {
  const from = speakerPoint(talk.fromId, orbs, placements);
  const to = speakerPoint(talk.toId, orbs, placements);
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
  orbs: SwarmOrb[],
  placements: OrbPlacements,
): { x: number; y: number } | null {
  if (isDirectorSpeaker(speakerId) || speakerId === DIRECTOR_SPEAKER_ID) {
    return projectSwarmToPlane(DIRECTOR_ORIGIN);
  }
  const orb = findOrb(orbs, speakerId);
  if (!orb.ok) return null;
  return resolveOrbPlane(orb.value, placements);
}

function linkPoints(
  link: SwarmLink,
  orbs: SwarmOrb[],
  placements: OrbPlacements,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const from = findOrb(orbs, link.fromId);
  const to = findOrb(orbs, link.toId);
  if (!from.ok || !to.ok) return null;
  const a = resolveOrbPlane(from.value, placements);
  const b = resolveOrbPlane(to.value, placements);
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}
