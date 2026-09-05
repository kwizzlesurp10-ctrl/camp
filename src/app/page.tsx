import { Suspense } from "react";
import { CampSwarmApp } from "@/components/persona/CampSwarmApp";

function SwarmFallback(): React.ReactElement {
  return (
    <div className="flex h-dvh items-center justify-center bg-[#000d1a] text-sm tracking-wide text-cyan-300/70">
      Lighting the lake…
    </div>
  );
}

export default function Home(): React.ReactElement {
  return (
    <Suspense fallback={<SwarmFallback />}>
      <CampSwarmApp />
    </Suspense>
  );
}
