import { afterEach, describe, expect, it } from "vitest";
import { authorizeBearerEnv } from "@/lib/route-secret";

const ENV_NAME = "DEPLOYMENTS_API_SECRET";

afterEach(() => {
  delete process.env[ENV_NAME];
  delete process.env.MCP_AUTH_SECRET;
});

describe("authorizeBearerEnv", () => {
  it("hides the organ when the fail-closed secret is missing", () => {
    const result = authorizeBearerEnv(new Headers(), ENV_NAME, "not-found");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(404);
      expect(result.error.error).toBe("Not found");
    }
  });

  it("stays open when the optional secret is missing", () => {
    const result = authorizeBearerEnv(new Headers(), "MCP_AUTH_SECRET", "allow");
    expect(result).toEqual({ ok: true, value: "authorized" });
  });

  it("accepts a matching bearer token", () => {
    process.env[ENV_NAME] = "lake-token";
    const result = authorizeBearerEnv(
      new Headers({ authorization: "Bearer lake-token" }),
      ENV_NAME,
      "not-found",
    );
    expect(result).toEqual({ ok: true, value: "authorized" });
  });

  it("rejects a wrong bearer token without advertising the secret", () => {
    process.env[ENV_NAME] = "lake-token";
    const result = authorizeBearerEnv(
      new Headers({ authorization: "Bearer other" }),
      ENV_NAME,
      "not-found",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(401);
      expect(result.error.error).toBe("Unauthorized");
    }
  });
});
