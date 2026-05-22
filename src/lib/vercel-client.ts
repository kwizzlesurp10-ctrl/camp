import { Vercel } from "@vercel/sdk";

function makeClient(): Vercel {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error(
      "VERCEL_TOKEN is not set. Copy env.example → .env.local and fill in your token."
    );
  }
  return new Vercel({ bearerToken: token });
}

// Lazy singleton — avoids re-constructing on every hot-reload in dev.
let _client: Vercel | undefined;

export function getVercelClient(): Vercel {
  _client ??= makeClient();
  return _client;
}

/** Convenience: resolved from env so callers don't repeat the lookup. */
export const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
export const VERCEL_TEAM_ID    = process.env.VERCEL_TEAM_ID;

export type { Vercel };
