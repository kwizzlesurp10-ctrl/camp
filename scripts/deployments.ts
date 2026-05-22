/**
 * Deployment management script.
 *
 * Usage:
 *   npx tsx scripts/deployments.ts list [--limit=10] [--target=production]
 *   npx tsx scripts/deployments.ts status <deploymentId>
 *   npx tsx scripts/deployments.ts redeploy [--target=production]
 *
 * Requires VERCEL_TOKEN (and optionally VERCEL_PROJECT_ID / VERCEL_TEAM_ID)
 * in your environment or .env.local.
 */

// Load .env.local automatically when running locally.
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { Vercel } from "@vercel/sdk";

const token     = process.env.VERCEL_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID;
const teamId    = process.env.VERCEL_TEAM_ID || undefined;

if (!token) {
  console.error("Error: VERCEL_TOKEN is not set.");
  process.exit(1);
}

const client = new Vercel({ bearerToken: token });

const [,, command = "list", ...args] = process.argv;

// Helpers ---------------------------------------------------------------

function flag(name: string, fallback: string): string {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split("=")[1] : fallback;
}

function fmt(date: number | string | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

// Commands --------------------------------------------------------------

async function list(): Promise<void> {
  const limit  = Number(flag("limit", "10"));
  const target = flag("target", "") as "production" | "preview" | "";

  const result = await client.deployments.getDeployments({
    projectId,
    teamId,
    limit,
    target: target || undefined,
  });

  const rows = result.deployments ?? [];
  if (rows.length === 0) {
    console.log("No deployments found.");
    return;
  }

  console.log(`\nDeployments (${rows.length}):\n`);
  for (const d of rows) {
    const state = d.state?.padEnd(12) ?? "UNKNOWN     ";
    console.log(`  ${state}  ${d.uid}  ${d.url ?? ""}  ${fmt(d.createdAt)}`);
  }
  console.log();
}

async function status(): Promise<void> {
  const idOrUrl = args[0];
  if (!idOrUrl) {
    console.error("Usage: deployments.ts status <deploymentId|url>");
    process.exit(1);
  }

  const d = await client.deployments.getDeployment({ idOrUrl, teamId });

  console.log(`\nDeployment: ${d.id}`);
  console.log(`  URL:     ${d.url ?? "—"}`);
  console.log(`  State:   ${d.readyState ?? "—"}`);
  console.log(`  Target:  ${d.target ?? "—"}`);
  console.log(`  Created: ${fmt(d.createdAt)}`);
  console.log(`  Ready:   ${fmt(d.ready)}`);
  console.log();
}

async function redeploy(): Promise<void> {
  const target = (flag("target", "production") as "production" | "preview");

  const { deployments } = await client.deployments.getDeployments({
    projectId,
    teamId,
    target,
    limit: 1,
  });

  const latest = deployments?.[0];
  if (!latest) {
    console.error(`No ${target} deployments found.`);
    process.exit(1);
  }

  console.log(`Redeploying ${latest.uid} (${latest.url ?? latest.name}) → ${target}…`);

  const next = await client.deployments.createDeployment({
    requestBody: {
      deploymentId: latest.uid,
      name: latest.name,
      target,
    },
    teamId,
  });

  console.log(`\nNew deployment created:`);
  console.log(`  ID:  ${next.id}`);
  console.log(`  URL: ${next.url ?? "—"}`);
  console.log();
}

// Dispatch --------------------------------------------------------------

const commands: Record<string, () => Promise<void>> = { list, status, redeploy };
const handler = commands[command];

if (!handler) {
  console.error(`Unknown command: ${command}. Available: list, status, redeploy`);
  process.exit(1);
}

handler().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
