"use client";

import { useState } from "react";
import Image from "next/image";

type PersonaImageGeneratorProps = {
  personaId: string;
  personaTitle: string;
};

type GenerationState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; imageUrl: string }
  | { status: "error"; message: string };

export function PersonaImageGenerator({
  personaId,
  personaTitle,
}: PersonaImageGeneratorProps): React.ReactElement {
  const [state, setState] = useState<GenerationState>({ status: "idle" });

  async function handleGenerate(): Promise<void> {
    setState({ status: "loading" });

    try {
      const response = await fetch(`/api/personas/${personaId}/image`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        setState({ status: "success", imageUrl: data.imageUrl });
      } else {
        throw new Error("No image returned");
      }
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[1.5px] text-zinc-500">
        AI Portrait
      </p>

      {state.status === "idle" && (
        <button
          type="button"
          onClick={() => void handleGenerate()}
          className="w-full py-3 rounded-2xl border border-dashed border-zinc-700 text-zinc-400 font-medium text-sm hover:border-emerald-500/40 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" />
          Generate Portrait
        </button>
      )}

      {state.status === "loading" && (
        <div className="w-full aspect-square rounded-2xl bg-zinc-800/50 border border-zinc-700 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">
            Generating portrait for {personaTitle}...
          </p>
        </div>
      )}

      {state.status === "success" && (
        <div className="space-y-3">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-zinc-700">
            <Image
              src={state.imageUrl}
              alt={`AI-generated portrait of ${personaTitle}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            className="w-full py-2 rounded-xl border border-zinc-700 text-zinc-400 text-xs hover:border-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-3 h-3" />
            Regenerate
          </button>
        </div>
      )}

      {state.status === "error" && (
        <div className="w-full rounded-2xl bg-red-950/30 border border-red-900/50 p-4 space-y-3">
          <p className="text-sm text-red-400">{state.message}</p>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            className="w-full py-2 rounded-xl border border-red-900/50 text-red-400 text-xs hover:border-red-700 hover:text-red-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M3 5h4" />
      <path d="M19 17v4" />
      <path d="M17 19h4" />
    </svg>
  );
}
