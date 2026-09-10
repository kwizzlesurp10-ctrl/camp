import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PERSONAS } from "@/data/personas";

describe("generateStaffReply", () => {
  const persona = PERSONAS[0]!;
  const question = "How do you handle homesick campers?";

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to draft reply when no AI keys are configured", async () => {
    const { generateStaffReply } = await import("@/lib/camp-staff-ai");
    const reply = await generateStaffReply(persona, question);
    expect(reply).toBeTruthy();
    expect(typeof reply).toBe("string");
    expect(reply.length).toBeGreaterThan(10);
  });

  it("returns a non-empty string for any persona", async () => {
    const { generateStaffReply } = await import("@/lib/camp-staff-ai");
    for (const p of PERSONAS) {
      const reply = await generateStaffReply(p, "Rainy day activities");
      expect(reply.length).toBeGreaterThan(0);
    }
  });
});
