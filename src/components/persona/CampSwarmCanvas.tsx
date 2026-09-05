"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { PERSONAS } from "@/data/personas";
import {
  buildCampSwarm,
  findOrb,
  formatTalkBeat,
  parseSwarmOrbId,
  talkingPairAt,
  type SwarmLink,
  type SwarmOrb,
  type Vec3,
} from "@/lib/camp-swarm";
import {
  DIRECTOR_ORIGIN,
  DIRECTOR_SPEAKER_ID,
  formatDirectedBeat,
  pairMatchesDirected,
  resolveSpeakerPosition,
  type TalkBeat,
} from "@/lib/camp-swarm-talk";

type CampSwarmCanvasProps = {
  selectedId: string | null;
  onSelectPersona: (id: string) => void;
  activeTalk: TalkBeat | null;
  showStatus?: boolean;
};

type TendrilBranch = {
  line: THREE.Line;
  microNode: THREE.Mesh;
  depth: number;
};

type PhaseRing = {
  ring: THREE.Line;
  age: number;
};

type TendrilEmitter = {
  age: number;
  growthSpeed: number;
  branches: TendrilBranch[];
  rings: PhaseRing[];
  update: (delta: number) => void;
  dispose: (scene: THREE.Scene) => void;
};

const TALK_INTERVAL_SEC = 4;

export function CampSwarmCanvas({
  selectedId,
  onSelectPersona,
  activeTalk,
  showStatus = true,
}: CampSwarmCanvasProps): React.ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelectPersona);
  const activeTalkRef = useRef(activeTalk);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    onSelectRef.current = onSelectPersona;
    activeTalkRef.current = activeTalk;
  }, [activeTalk, onSelectPersona, selectedId]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const swarm = buildCampSwarm(PERSONAS);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000d1a, 0.0011);

    const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 8000);
    camera.position.set(0, 40, 168);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000d1a, 1);
    host.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.inset = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    host.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 90;
    controls.maxDistance = 280;
    controls.target.set(0, 12, -12);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(host.clientWidth, host.clientHeight),
        reduceMotion ? 1.1 : 2.0,
        1.0,
        0.05,
      ),
    );

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const orbById = new Map<string, THREE.Mesh>();

    for (const orb of swarm.orbs) {
      const mesh = createOrbMesh(orb);
      nodeGroup.add(mesh);
      orbById.set(orb.personaId, mesh);

      const light = new THREE.PointLight(orb.tone.hex, 12, 110);
      light.position.copy(mesh.position);
      scene.add(light);
      mesh.userData.light = light;

      const label = document.createElement("div");
      label.className = "camp-swarm-label";
      label.textContent = orb.shortLabel;
      label.style.color = orb.tone.css;
      label.style.fontSize = "11px";
      label.style.letterSpacing = "0.08em";
      label.style.fontWeight = "600";
      label.style.textTransform = "uppercase";
      label.style.whiteSpace = "nowrap";
      label.style.textShadow = "0 0 12px rgba(0, 20, 40, 0.9)";
      const labelObject = new CSS2DObject(label);
      labelObject.position.set(0, 14, 0);
      mesh.add(labelObject);
    }

    const dock = createDockMarker();
    scene.add(dock.mesh, dock.light);
    const dockLabel = document.createElement("div");
    dockLabel.className = "camp-swarm-label";
    dockLabel.textContent = "You";
    dockLabel.style.color = "#9ef6ff";
    dockLabel.style.fontSize = "11px";
    dockLabel.style.letterSpacing = "0.12em";
    dockLabel.style.fontWeight = "700";
    dockLabel.style.textTransform = "uppercase";
    dockLabel.style.textShadow = "0 0 12px rgba(0, 20, 40, 0.9)";
    const dockLabelObject = new CSS2DObject(dockLabel);
    dockLabelObject.position.set(0, 8, 0);
    dock.mesh.add(dockLabelObject);

    const directed = createDirectedLink();
    scene.add(directed.line, directed.pulse, directed.arrow);

    const linkObjects = swarm.links.map((link) => {
      const from = requireOrb(swarm.orbs, link.fromId);
      const to = requireOrb(swarm.orbs, link.toId);
      const start = new THREE.Vector3(from.position.x, from.position.y, from.position.z);
      const end = new THREE.Vector3(to.position.x, to.position.y, to.position.z);
      const mid = start.clone().lerp(end, 0.5);
      mid.y += link.kind === "staff-room" ? 10 : 4;
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
      const material = new THREE.LineBasicMaterial({
        color: from.tone.hex,
        transparent: true,
        opacity: link.kind === "cluster" ? 0.35 : 0.22,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);

      const pulseGeo = new THREE.IcosahedronGeometry(1.1, 0);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: to.tone.hex,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(pulse);

      return { link, curve, line, pulse, from, to };
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const activeTendrils: TendrilEmitter[] = [];
    let talkTick = 0;
    let talkAge = 0;
    let clock = 0;
    let disposed = false;
    let frame = 0;

    const setStatus = (text: string): void => {
      if (statusRef.current) statusRef.current.textContent = text;
    };

    const announceTalk = (tick: number): void => {
      if (activeTalkRef.current) return;
      const pair = talkingPairAt(tick, swarm.links);
      if (!pair.ok) return;
      const from = findOrb(swarm.orbs, pair.value.fromId);
      const to = findOrb(swarm.orbs, pair.value.toId);
      if (!from.ok || !to.ok) return;
      setStatus(formatTalkBeat(from.value, to.value));
    };
    announceTalk(0);

    let lastTalkKey = "";
    const burstForTalk = (talk: TalkBeat): void => {
      const fromPos = resolveSpeakerPosition(talk.fromId, swarm.orbs);
      if (!fromPos.ok) return;
      const color = toneForSpeaker(talk.fromId, swarm.orbs);
      const origin = vec3From(fromPos.value);
      const emitter = createTendrilEmitter(origin, color, scene);
      emitter.rings = createPhaseRings(origin, color, scene);
      activeTendrils.push(emitter);
    };

    const onClick = (event: MouseEvent): void => {
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeGroup.children);
      const mesh = hits[0]?.object;
      if (!(mesh instanceof THREE.Mesh)) return;
      const parsed = parseSwarmOrbId(mesh.userData.personaId);
      if (!parsed.ok) return;
      const orb = findOrb(swarm.orbs, parsed.value);
      if (!orb.ok) return;
      const emitter = createTendrilEmitter(mesh.position, orb.value.tone.hex, scene);
      emitter.rings = createPhaseRings(mesh.position, orb.value.tone.hex, scene);
      activeTendrils.push(emitter);
      setStatus(`Tendril burst from ${orb.value.title}`);
      onSelectRef.current(parsed.value);
    };

    renderer.domElement.addEventListener("click", onClick);

    const resize = (): void => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      labelRenderer.setSize(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const animate = (): void => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      clock += 0.016;
      talkAge += 0.016;
      controls.update();

      if (!activeTalkRef.current && talkAge >= TALK_INTERVAL_SEC) {
        talkAge = 0;
        talkTick += 1;
        announceTalk(talkTick);
      }

      const ambientTalk = talkingPairAt(talkTick, swarm.links);
      const liveTalk = activeTalkRef.current;
      const directedTalk: TalkBeat | null = liveTalk
        ? liveTalk
        : ambientTalk.ok
          ? {
              fromId: ambientTalk.value.fromId,
              toId: ambientTalk.value.toId,
              kind: "staff-handoff",
              text: "",
            }
          : null;

      if (liveTalk) {
        const talkKey = `${liveTalk.fromId}->${liveTalk.toId}:${liveTalk.kind}:${liveTalk.text}`;
        if (talkKey !== lastTalkKey) {
          lastTalkKey = talkKey;
          burstForTalk(liveTalk);
          setStatus(formatDirectedBeat(liveTalk, swarm.orbs));
        }
      } else {
        lastTalkKey = "";
      }

      const talkingIds = new Set(
        directedTalk ? [directedTalk.fromId, directedTalk.toId] : [],
      );

      nodeGroup.children.forEach((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        const personaId = String(node.userData.personaId ?? "");
        const selected = selectedIdRef.current === personaId;
        const speaking = talkingIds.has(personaId);
        const pulse = 0.6 + 0.4 * Math.sin(clock * 1.9 + Number(node.userData.phase ?? 0));
        const scaleBoost = (selected ? 0.18 : 0) + (speaking ? 0.16 : 0);
        node.scale.setScalar(1 + pulse * (reduceMotion ? 0.08 : 0.28) + scaleBoost);
        if (node.material instanceof THREE.MeshStandardMaterial) {
          node.material.emissiveIntensity =
            (selected || speaking ? 2.4 : 1.4) + pulse * 1.4;
        }
        const light = node.userData.light;
        if (light instanceof THREE.PointLight) {
          light.intensity = (selected || speaking ? 18 : 10) + pulse * 14;
        }
      });

      const dockPulse = talkingIds.has(DIRECTOR_SPEAKER_ID)
        ? 1.35 + Math.sin(clock * 6) * 0.2
        : 1;
      dock.mesh.scale.setScalar(dockPulse);
      dock.light.intensity = talkingIds.has(DIRECTOR_SPEAKER_ID) ? 22 : 8;

      updateDirectedLink(directed, directedTalk, swarm.orbs, clock);

      linkObjects.forEach((item, index) => {
        const talking =
          directedTalk !== null &&
          pairMatchesDirected(
            directedTalk.fromId,
            directedTalk.toId,
            item.link.fromId,
            item.link.toId,
          );
        const travel = (clock * 0.18 + index * 0.13) % 1;
        const directedT =
          talking && directedTalk
            ? travelToward(item.link, directedTalk, clock)
            : travel;
        const point = item.curve.getPoint(directedT);
        item.pulse.position.copy(point);
        item.pulse.scale.setScalar(talking ? 1.6 : 1);
        if (item.line.material instanceof THREE.LineBasicMaterial) {
          item.line.material.opacity = talking
            ? 0.85
            : item.link.kind === "cluster"
              ? 0.28 + Math.sin(clock * 1.4 + index) * 0.08
              : 0.16 + Math.sin(clock * 1.1 + index) * 0.06;
        }
      });

      for (let i = activeTendrils.length - 1; i >= 0; i -= 1) {
        const emitter = activeTendrils[i];
        if (!emitter) continue;
        emitter.update(0.016);
        let ringsDone = true;
        emitter.rings.forEach((ring) => {
          ring.age += 0.016;
          ring.ring.scale.setScalar(1 + ring.age * 4);
          if (ring.ring.material instanceof THREE.LineBasicMaterial) {
            ring.ring.material.opacity = Math.max(0, 1 - ring.age * 1.8);
          }
          if (ring.age <= 2) ringsDone = false;
        });
        if (ringsDone && emitter.rings.length > 0) {
          emitter.dispose(scene);
          activeTendrils.splice(i, 1);
        }
      }

      composer.render();
      labelRenderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("click", onClick);
      activeTendrils.forEach((emitter) => emitter.dispose(scene));
      disposeDirectedLink(scene, directed);
      scene.remove(dock.mesh, dock.light);
      dock.mesh.geometry.dispose();
      if (dock.mesh.material instanceof THREE.Material) dock.mesh.material.dispose();
      linkObjects.forEach((item) => {
        scene.remove(item.line, item.pulse);
        item.line.geometry.dispose();
        item.pulse.geometry.dispose();
        if (item.line.material instanceof THREE.Material) item.line.material.dispose();
        if (item.pulse.material instanceof THREE.Material) item.pulse.material.dispose();
      });
      nodeGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
          const light = obj.userData.light;
          if (light instanceof THREE.Light) scene.remove(light);
        }
      });
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
      if (labelRenderer.domElement.parentElement === host) {
        host.removeChild(labelRenderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="absolute inset-0" />
      <p
        ref={statusRef}
        role="status"
        aria-live="polite"
        className={
          showStatus
            ? "pointer-events-none absolute bottom-3 left-3 z-10 max-w-[min(36rem,calc(100%-1.5rem))] rounded-lg bg-cyan-400/15 px-3.5 py-2 text-xs text-cyan-200"
            : "sr-only"
        }
      >
        Click any glowing counsellor for a tendril burst
      </p>
    </div>
  );
}

function createOrbMesh(orb: SwarmOrb): THREE.Mesh {
  const geometry = new THREE.IcosahedronGeometry(9, 2);
  const posAttr = geometry.attributes.position;
  for (let j = 0; j < posAttr.count; j += 1) {
    const vertex = new THREE.Vector3().fromBufferAttribute(posAttr, j);
    vertex.normalize().multiplyScalar(9 + Math.random() * 3);
    posAttr.setXYZ(j, vertex.x, vertex.y, vertex.z);
  }
  const material = new THREE.MeshStandardMaterial({
    color: orb.tone.hex,
    emissive: orb.tone.emissiveHex,
    emissiveIntensity: 1.8,
    metalness: 0.25,
    roughness: 0.65,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(orb.position.x, orb.position.y, orb.position.z);
  mesh.userData = { phase: orb.phase, personaId: orb.personaId, name: orb.title };
  return mesh;
}

function createTendrilEmitter(
  position: THREE.Vector3,
  color: number,
  scene: THREE.Scene,
): TendrilEmitter {
  const branches: TendrilBranch[] = [];
  const maxDepth = 5;

  const createBranch = (
    start: THREE.Vector3,
    direction: THREE.Vector3,
    depth: number,
    length: number,
  ): void => {
    if (depth > maxDepth) return;
    const end = start.clone().add(direction.clone().normalize().multiplyScalar(length));
    const curve = new THREE.CatmullRomCurve3([
      start,
      start.clone().add(direction.clone().multiplyScalar(0.4)),
      end,
    ]);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
    const lineMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    const microGeo = new THREE.IcosahedronGeometry(Math.max(0.35, 1.2 - depth * 0.2), 1);
    const microMat = new THREE.MeshBasicMaterial({
      color,
      blending: THREE.AdditiveBlending,
    });
    const microNode = new THREE.Mesh(microGeo, microMat);
    microNode.position.copy(end);
    scene.add(microNode);
    branches.push({ line, microNode, depth });

    if (depth < maxDepth) {
      for (let i = 0; i < 3; i += 1) {
        const angle = (i - 1) * 0.8 + (Math.random() - 0.5) * 1.2;
        const nextDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        createBranch(end, nextDir, depth + 1, length * 0.65);
      }
    }
  };

  createBranch(position.clone(), new THREE.Vector3(0, 1, 0), 0, 12);

  return {
    age: 0,
    growthSpeed: 0.8,
    branches,
    rings: [],
    update(delta: number) {
      this.age += delta;
      const progress = Math.min(1, this.age * this.growthSpeed);
      this.branches.forEach((branch) => {
        if (branch.line.material instanceof THREE.LineBasicMaterial) {
          branch.line.material.opacity = 1 - progress * 0.6;
        }
        branch.microNode.scale.setScalar(0.8 + Math.sin(this.age * 12 + branch.depth) * 0.4);
      });
    },
    dispose(target: THREE.Scene) {
      this.branches.forEach((branch) => {
        target.remove(branch.line, branch.microNode);
        branch.line.geometry.dispose();
        branch.microNode.geometry.dispose();
        if (branch.line.material instanceof THREE.Material) branch.line.material.dispose();
        if (branch.microNode.material instanceof THREE.Material) {
          branch.microNode.material.dispose();
        }
      });
      this.rings.forEach((ring) => {
        target.remove(ring.ring);
        ring.ring.geometry.dispose();
        if (ring.ring.material instanceof THREE.Material) ring.ring.material.dispose();
      });
    },
  };
}

function createPhaseRings(
  position: THREE.Vector3,
  color: number,
  scene: THREE.Scene,
): PhaseRing[] {
  const rings: PhaseRing[] = [];
  for (let i = 0; i < 6; i += 1) {
    const radius = 4 + i * 6;
    const points: THREE.Vector3[] = [];
    for (let a = 0; a < 64; a += 1) {
      const ang = (a / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(ang) * radius, 0, Math.sin(ang) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Line(geometry, material);
    ring.position.copy(position);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    rings.push({ ring, age: i * 0.2 });
  }
  return rings;
}

function requireOrb(orbs: SwarmOrb[], id: string): SwarmOrb {
  const found = findOrb(orbs, id);
  if (!found.ok) {
    throw new Error(found.error);
  }
  return found.value;
}

function vec3From(position: Vec3): THREE.Vector3 {
  return new THREE.Vector3(position.x, position.y, position.z);
}

function toneForSpeaker(speakerId: string, orbs: SwarmOrb[]): number {
  if (speakerId === DIRECTOR_SPEAKER_ID) return 0x9ef6ff;
  const orb = findOrb(orbs, speakerId);
  return orb.ok ? orb.value.tone.hex : 0x00ffff;
}

function travelToward(link: SwarmLink, talk: TalkBeat, clock: number): number {
  const t = (clock * 0.45) % 1;
  if (talk.fromId === link.toId && talk.toId === link.fromId) return 1 - t;
  return t;
}

type DirectedLink = {
  line: THREE.Line;
  pulse: THREE.Mesh;
  arrow: THREE.Mesh;
};

function createDockMarker(): { mesh: THREE.Mesh; light: THREE.PointLight } {
  const geometry = new THREE.OctahedronGeometry(4.2, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x9ef6ff,
    emissive: 0x2288aa,
    emissiveIntensity: 2.2,
    metalness: 0.15,
    roughness: 0.4,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(DIRECTOR_ORIGIN.x, DIRECTOR_ORIGIN.y, DIRECTOR_ORIGIN.z);
  const light = new THREE.PointLight(0x9ef6ff, 8, 90);
  light.position.copy(mesh.position);
  return { mesh, light };
}

function createDirectedLink(): DirectedLink {
  const line = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({
      color: 0x9ef6ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    }),
  );
  const pulse = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 0),
    new THREE.MeshBasicMaterial({
      color: 0x9ef6ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    }),
  );
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 3.4, 8),
    new THREE.MeshBasicMaterial({
      color: 0xccffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    }),
  );
  return { line, pulse, arrow };
}

function updateDirectedLink(
  directed: DirectedLink,
  talk: TalkBeat | null,
  orbs: SwarmOrb[],
  clock: number,
): void {
  const show = talk !== null;
  setDirectedOpacity(directed, show ? 0.95 : 0);
  if (!talk) return;

  const from = resolveSpeakerPosition(talk.fromId, orbs);
  const to = resolveSpeakerPosition(talk.toId, orbs);
  if (!from.ok || !to.ok) {
    setDirectedOpacity(directed, 0);
    return;
  }

  const start = vec3From(from.value);
  const end = vec3From(to.value);
  const mid = start.clone().lerp(end, 0.5);
  mid.y += 16;
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  directed.line.geometry.dispose();
  directed.line.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
  if (directed.line.material instanceof THREE.LineBasicMaterial) {
    directed.line.material.color.setHex(toneForSpeaker(talk.fromId, orbs));
  }

  const t = (clock * 0.55) % 1;
  const point = curve.getPoint(t);
  const ahead = curve.getPoint(Math.min(1, t + 0.08));
  directed.pulse.position.copy(point);
  directed.arrow.position.copy(ahead);
  directed.arrow.lookAt(curve.getPoint(Math.min(1, t + 0.16)));
  directed.arrow.rotateX(Math.PI / 2);
}

function setDirectedOpacity(directed: DirectedLink, opacity: number): void {
  if (directed.line.material instanceof THREE.LineBasicMaterial) {
    directed.line.material.opacity = opacity;
  }
  if (directed.pulse.material instanceof THREE.MeshBasicMaterial) {
    directed.pulse.material.opacity = opacity;
  }
  if (directed.arrow.material instanceof THREE.MeshBasicMaterial) {
    directed.arrow.material.opacity = opacity;
  }
}

function disposeDirectedLink(scene: THREE.Scene, directed: DirectedLink): void {
  scene.remove(directed.line, directed.pulse, directed.arrow);
  directed.line.geometry.dispose();
  directed.pulse.geometry.dispose();
  directed.arrow.geometry.dispose();
  if (directed.line.material instanceof THREE.Material) directed.line.material.dispose();
  if (directed.pulse.material instanceof THREE.Material) directed.pulse.material.dispose();
  if (directed.arrow.material instanceof THREE.Material) directed.arrow.material.dispose();
}
