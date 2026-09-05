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
        <div className="border-b border-zinc-800 pb-8 mb-10 space-y-5">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-9 h-9 rounded-2xl" />
            <div className="space-y-2">
              <SkeletonBox className="h-8 w-80" />
              <SkeletonBox className="h-3 w-44" />
            </div>
          </div>
          <SkeletonBox className="h-5 w-2/3" />
        </div>
        <SkeletonBox className="h-[28rem] w-full rounded-3xl" />
      </div>
    </div>
  );
}

export default function PersonasPage(): React.ReactElement {
  return (
    <Suspense fallback={<LandingFallback />}>
      <PersonaLanding />
    </Suspense>
  );
}
