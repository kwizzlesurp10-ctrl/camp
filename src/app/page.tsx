import { Suspense } from "react";
import { PersonaLanding } from "@/components/persona/PersonaLanding";

function SkeletonBox({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}): React.ReactElement {
  return <div className={`bg-zinc-800 rounded animate-pulse ${className}`} style={style} />;
}

function LandingFallback(): React.ReactElement {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-8 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-8 mb-10 space-y-5">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-9 h-9 rounded-2xl" />
            <div className="space-y-2">
              <SkeletonBox className="h-8 w-80" />
              <SkeletonBox className="h-3 w-44" />
            </div>
          </div>
          <SkeletonBox className="h-5 w-2/3" />
          <SkeletonBox className="h-4 w-1/2" />
          <div className="flex gap-3">
            <SkeletonBox className="h-9 w-44 rounded-xl" />
            <SkeletonBox className="h-9 w-36 rounded-xl" />
          </div>
          <div className="flex gap-3">
            {[112, 80, 80].map((w, i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 w-28 space-y-1">
                <SkeletonBox className="h-2.5 w-14" />
                <SkeletonBox className="h-7 w-8" />
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="space-y-3 mb-8">
          <SkeletonBox className="h-11 w-full rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            {[72, 96, 112, 88, 104].map((w, i) => (
              <SkeletonBox key={i} className="h-7 rounded-full" style={{ width: w } as React.CSSProperties} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[88, 104, 80, 120, 96, 88, 72, 112].map((w, i) => (
              <SkeletonBox key={i} className="h-6 rounded-full" style={{ width: w } as React.CSSProperties} />
            ))}
          </div>
        </div>

        {/* Cluster sections */}
        <div className="space-y-6">
          {[3, 2].map((cardCount, si) => (
            <div key={si} className="border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="px-6 sm:px-8 py-5 bg-zinc-900 flex items-center gap-3">
                <SkeletonBox className="h-6 w-44" />
                <SkeletonBox className="h-5 w-20 rounded-full" />
              </div>
              <div className="px-6 sm:px-8 pb-8 pt-4">
                <SkeletonBox className="h-4 w-64 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: cardCount }).map((_, ci) => (
                    <div key={ci} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                      <SkeletonBox className="h-5 w-3/4" />
                      <div className="flex gap-2">
                        <SkeletonBox className="h-5 w-20 rounded-full" />
                        <SkeletonBox className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <SkeletonBox className="h-3 w-full" />
                        <SkeletonBox className="h-3 w-5/6" />
                        <SkeletonBox className="h-3 w-3/5" />
                      </div>
                      <div className="pt-4 border-t border-zinc-800 flex gap-2">
                        <SkeletonBox className="h-5 w-24 rounded" />
                        <SkeletonBox className="h-5 w-20 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home(): React.ReactElement {
  return (
    <Suspense fallback={<LandingFallback />}>
      <PersonaLanding />
    </Suspense>
  );
}
