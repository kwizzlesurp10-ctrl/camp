import type { Metadata } from "next";
import { PrintTrainingGuide } from "@/components/training/PrintTrainingGuide";
import { parsePersonaIdParam } from "@/lib/persona-url";
import "./print.css";

export const metadata: Metadata = {
  title: "Staff Training Guide — Northern Camp Personas",
  description: "Printable staff training reference for northern teenage summer camp archetypes.",
};

type PrintPageProps = {
  searchParams: Promise<{ persona?: string }>;
};

export default async function PrintPage({
  searchParams,
}: PrintPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const personaId = parsePersonaIdParam(params.persona);

  return <PrintTrainingGuide personaId={personaId ?? undefined} />;
}
