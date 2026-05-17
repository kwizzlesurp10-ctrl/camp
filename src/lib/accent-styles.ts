const ACCENT_MAP: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400",
  amber: "bg-amber-500/10 text-amber-400",
  sky: "bg-sky-500/10 text-sky-400",
  violet: "bg-violet-500/10 text-violet-400",
  orange: "bg-orange-500/10 text-orange-400",
  blue: "bg-blue-500/10 text-blue-400",
  rose: "bg-rose-500/10 text-rose-400",
  yellow: "bg-yellow-500/10 text-yellow-400",
  red: "bg-red-500/10 text-red-400",
  cyan: "bg-cyan-500/10 text-cyan-400",
  lime: "bg-lime-500/10 text-lime-400",
  fuchsia: "bg-fuchsia-500/10 text-fuchsia-400",
  zinc: "bg-zinc-800 text-zinc-300",
};

export function tagAccentClass(accent: string): string {
  return ACCENT_MAP[accent] ?? ACCENT_MAP.zinc;
}
