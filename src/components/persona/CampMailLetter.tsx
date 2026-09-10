"use client";

import { useState } from "react";
import type { CampLetter } from "@/lib/camp-staff-letter";

type CampMailLetterProps = {
  letter: CampLetter;
  compact?: boolean;
};

export function CampMailLetter({
  letter,
  compact = false,
}: CampMailLetterProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(!compact);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full items-center gap-3 rounded-xl border border-cyan-500/20 bg-[#0d1f2d] px-4 py-3 text-left transition-colors hover:border-cyan-400/40 hover:bg-[#0f2535]"
      >
        <span className="shrink-0 text-lg" aria-hidden>
          ✉
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-cyan-200">
            Letter from {letter.envelopeFrom.split("·")[0]?.trim()}
          </span>
          <span className="block truncate text-[10px] text-cyan-300/50">
            {letter.postmark} — tap to open
          </span>
        </span>
        <span className="text-[10px] font-medium tracking-wider text-cyan-400/60 uppercase group-hover:text-cyan-300">
          Open
        </span>
      </button>
    );
  }

  return (
    <article
      role="article"
      aria-label={`Letter from ${letter.envelopeFrom.split("·")[0]?.trim()}`}
      className="overflow-hidden rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-[#f5f0e8] to-[#ede7d9] shadow-lg shadow-black/30"
    >
      <div className="border-b border-[#d4c9b5] bg-[#e8e0d0] px-5 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-semibold tracking-[2px] text-[#6b5c4a] uppercase">
            {letter.letterhead}
          </p>
          {compact && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 text-[10px] font-medium tracking-wider text-[#8a7a66] uppercase hover:text-[#5a4d3e] transition-colors"
            >
              Fold ✕
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#8a7a66]">
          <span className="rounded-sm border border-[#c4b8a4] px-1.5 py-0.5 font-mono text-[9px]">
            {letter.postmark}
          </span>
        </div>
      </div>

      <div className="space-y-1 border-b border-[#d4c9b5]/60 px-5 py-3 text-[11px] text-[#6b5c4a]">
        <p>
          <span className="font-semibold tracking-wide uppercase">From:</span>{" "}
          {letter.envelopeFrom}
        </p>
        <p>
          <span className="font-semibold tracking-wide uppercase">To:</span>{" "}
          {letter.envelopeTo}
        </p>
      </div>

      <div
        className="px-5 py-4 space-y-3"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 1.45em, #d4c9b540 1.45em, #d4c9b540 1.5em)",
        }}
      >
        <p className="text-sm font-medium text-[#3d3428]">{letter.salutation}</p>
        <div className="space-y-2.5 text-[13px] leading-relaxed text-[#4a3f32]">
          {letter.body.split("\n").filter(Boolean).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="border-t border-[#d4c9b5]/40 px-5 py-4">
        <p className="text-[13px] italic text-[#5a4d3e]">{letter.closing}</p>
        <p className="mt-2 whitespace-pre-line text-sm font-semibold text-[#3d3428]">
          {letter.signature}
        </p>
        {letter.ps ? (
          <p className="mt-3 text-[12px] italic text-[#7a6b58]">
            P.S. {letter.ps}
          </p>
        ) : null}
      </div>
    </article>
  );
}
