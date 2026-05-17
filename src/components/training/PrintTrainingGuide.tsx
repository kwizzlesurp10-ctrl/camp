import Link from "next/link";
import {
  PERSONA_CLUSTERS,
  PERSONAS,
  getClusterById,
  getPersonaById,
  type Persona,
} from "@/data/personas";
import { PrintControls } from "@/components/training/PrintControls";
import { buildPersonaHref } from "@/lib/persona-url";

type PrintTrainingGuideProps = {
  personaId?: string | null;
};

export function PrintTrainingGuide({
  personaId,
}: PrintTrainingGuideProps): React.ReactElement {
  const single = personaId ? getPersonaById(personaId) : undefined;
  const clusters = single
    ? PERSONA_CLUSTERS.filter((c) => c.id === single.clusterId)
    : PERSONA_CLUSTERS;

  const personasByCluster = (clusterId: Persona["clusterId"]): Persona[] => {
    if (single) return single.clusterId === clusterId ? [single] : [];
    return PERSONAS.filter((p) => p.clusterId === clusterId);
  };

  const title = single
    ? `${single.title} — Staff Training`
    : "Northern Camp Staff — Training Guide";

  return (
    <div className="print-guide min-h-screen bg-white text-zinc-900">
      <div className="max-w-4xl mx-auto px-8 py-10">
        <PrintControls backHref={single ? buildPersonaHref("/", single.id) : "/"} />

        <header className="print-header border-b-2 border-zinc-300 pb-6 mb-8">
          <p className="text-xs uppercase tracking-[3px] text-emerald-700 font-semibold mb-2">
            Northern Teenage Summer Camp • Staff Training • 2026
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed max-w-2xl">
            {single
              ? "Single-archetype reference for mentorship conversations, role clarity, and agent simulation prompts."
              : "Complete archetype map for onboarding, supervision, and multi-agent orchestration. Print or save as PDF from your browser."}
          </p>
          {single && (
            <p className="mt-2 text-xs text-zinc-500 font-mono">
              Deep link: /?persona={single.id} • API: /api/personas/{single.id}
            </p>
          )}
        </header>

        {clusters.map((cluster) => {
          const clusterPersonas = personasByCluster(cluster.id);
          if (clusterPersonas.length === 0) return null;

          return (
            <section key={cluster.id} className="print-cluster mb-10 break-inside-avoid">
              <h2 className="text-lg font-bold border-b border-zinc-200 pb-2 mb-4">
                {cluster.label}
              </h2>
              <p className="text-sm text-zinc-600 mb-6">{cluster.description}</p>

              <PersonaPrintBlocks personas={clusterPersonas} />
            </section>
          );
        })}

        <footer className="print-footer mt-12 pt-6 border-t border-zinc-300 text-xs text-zinc-500">
          <p>
            Generated from the Northern Camp Staff Persona DOM. API:{" "}
            <span className="font-mono">GET /api/personas</span>
            {single ? (
              <>
                {" "}
                • <span className="font-mono">GET /api/personas/{single.id}</span>
              </>
            ) : null}
          </p>
          <p className="mt-1">NORTHERN • TEEN • SUMMER • 2026</p>
        </footer>
      </div>
    </div>
  );
}

function PersonaPrintBlocks({ personas }: { personas: Persona[] }): React.ReactElement {
  return (
    <div className="space-y-8">
      {personas.map((persona) => {
        const cluster = getClusterById(persona.clusterId);
        return (
          <article
            key={persona.id}
            className="print-persona break-inside-avoid border border-zinc-200 rounded-lg p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <h3 className="text-xl font-semibold">{persona.title}</h3>
              <Link
                href={buildPersonaHref("/", persona.id)}
                className="no-print text-xs text-emerald-700 underline"
              >
                Open in explorer
              </Link>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
              {cluster?.label} • ID: {persona.id}
            </p>
            <p className="text-xs text-zinc-500 mb-1">Tags</p>
            <p className="text-sm mb-4">{persona.tags.map((t) => t.label).join(" • ")}</p>

            <PrintField label="Essence" value={persona.essence} />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  Motivations
                </p>
                <ul className="text-sm space-y-1">
                  {persona.motivations.map((m) => (
                    <li key={m}>• {m}</li>
                  ))}
                </ul>
              </div>
              <PrintField label="Pain Points" value={persona.painPoints} />
            </div>
            <PrintField label="Teen Communication" value={persona.teenCommunication} />
            <p className="text-xs uppercase tracking-wide text-zinc-500 mt-4 mb-1">Traits</p>
            <p className="text-sm">{persona.traits.join(" • ")}</p>
          </article>
        );
      })}
    </div>
  );
}

function PrintField({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="mt-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
