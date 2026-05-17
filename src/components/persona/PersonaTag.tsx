import { tagAccentClass } from "@/lib/accent-styles";

type PersonaTagProps = {
  label: string;
  accent: string;
};

export function PersonaTag({ label, accent }: PersonaTagProps): React.ReactElement {
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${tagAccentClass(accent)}`}
    >
      {label}
    </span>
  );
}
