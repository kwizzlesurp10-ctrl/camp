import { NextResponse } from "next/server";
import {
  buildPersonasListResponse,
  parsePersonasListQuery,
  resolvePersonasList,
} from "@/lib/persona-api";

export function GET(request: Request): NextResponse {
  const { searchParams } = new URL(request.url);
  const query = parsePersonasListQuery(searchParams);

  if (!query.ok) {
    return NextResponse.json(
      { error: query.error, code: "BAD_REQUEST" as const },
      { status: 400 },
    );
  }

  const personas = resolvePersonasList(query.value.cluster);
  return NextResponse.json(buildPersonasListResponse(personas), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
