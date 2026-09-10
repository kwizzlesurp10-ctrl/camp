"use client";

import Link from "next/link";

type PrintControlsProps = {
  backHref?: string;
};

export function PrintControls({
  backHref = "/",
}: PrintControlsProps): React.ReactElement {
  return (
    <div className="print-controls no-print flex flex-wrap items-center gap-3 mb-8">
      <button
        type="button"
        onClick={() => window.print()}
        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
      >
        Save as PDF / Print
      </button>
      <Link
        href={backHref}
        className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 transition-colors"
      >
        Back to explorer
      </Link>
    </div>
  );
}
