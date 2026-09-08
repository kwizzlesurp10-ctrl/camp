import { timingSafeEqual } from "node:crypto";
import { err, ok, type Result } from "@/lib/result";

export type SecretDenial = {
  status: 401 | 404;
  error: string;
};

export type MissingSecretMode = "allow" | "not-found";

export function authorizeBearerEnv(
  headers: Headers,
  envName: string,
  whenMissing: MissingSecretMode,
): Result<"authorized", SecretDenial> {
  const secret = process.env[envName]?.trim() ?? "";
  if (secret.length === 0) {
    switch (whenMissing) {
      case "allow":
        return ok("authorized");
      case "not-found":
        return err({ status: 404, error: "Not found" });
      default: {
        const exhaustive: never = whenMissing;
        throw new Error(`Unhandled secret mode: ${String(exhaustive)}`);
      }
    }
  }

  const header = headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!secretsEqual(token, secret)) {
    return err({ status: 401, error: "Unauthorized" });
  }
  return ok("authorized");
}

export function secretsEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}
