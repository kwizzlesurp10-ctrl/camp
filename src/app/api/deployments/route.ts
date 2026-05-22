import { type NextRequest, NextResponse } from "next/server";
import {
  getVercelClient,
  VERCEL_PROJECT_ID,
  VERCEL_TEAM_ID,
} from "@/lib/vercel-client";

export const dynamic = "force-dynamic";

/** GET /api/deployments?limit=10&target=production */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const client = getVercelClient();
    const { searchParams } = request.nextUrl;

    const result = await client.deployments.getDeployments({
      projectId: VERCEL_PROJECT_ID,
      teamId: VERCEL_TEAM_ID ?? undefined,
      limit: Math.min(Number(searchParams.get("limit") ?? "10"), 50),
      target: (searchParams.get("target") as "production" | "preview") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

/** POST /api/deployments — redeploy the latest production deployment */
export async function POST(): Promise<NextResponse> {
  try {
    const client = getVercelClient();

    const { deployments } = await client.deployments.getDeployments({
      projectId: VERCEL_PROJECT_ID,
      teamId: VERCEL_TEAM_ID ?? undefined,
      target: "production",
      limit: 1,
    });

    const latest = deployments?.[0];
    if (!latest) {
      return NextResponse.json(
        { error: "No production deployments found to redeploy." },
        { status: 404 }
      );
    }

    const redeployment = await client.deployments.createDeployment({
      requestBody: {
        deploymentId: latest.uid,
        name: latest.name,
        target: "production",
      },
      teamId: VERCEL_TEAM_ID ?? undefined,
    });

    return NextResponse.json(redeployment, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

function errorResponse(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : String(error);
  const status  = message.includes("VERCEL_TOKEN") ? 503 : 500;
  return NextResponse.json({ error: message }, { status });
}
