import { NextResponse } from "next/server";
import {
  buildPersonaDetailResponse,
  getPersonaForApi,
} from "@/lib/persona-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  const result = getPersonaForApi(id);

  if (!result.ok) {
    return NextResponse.json(result.error, { status: 404 });
  }

  return NextResponse.json(buildPersonaDetailResponse(result.value), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
