import { Suspense } from "react";
import { PersonaLanding } from "@/components/persona/PersonaLanding";

function LandingFallback(): React.ReactElement {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
      Loading camp staff personas…
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
