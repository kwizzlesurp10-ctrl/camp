import { describe, expect, it } from "vitest";
import { getPersonaById } from "@/data/personas";
import {
  buildDraftStaffReply,
  buildStaffChatPacket,
  buildStaffSystemPrompt,
  formatStaffChatForMcp,
} from "@/lib/camp-staff-chat";
import {
  chatWithStaff,
  getStaffDetail,
  listStaffSummaries,
  searchStaff,
} from "@/lib/camp-staff-mcp";

describe("camp staff chat helpers", () => {
  const persona = getPersonaById("heart-centered-listener");
  if (!persona) throw new Error("missing fixture persona");

  it("builds a system prompt that embeds the persona card", () => {
    const prompt = buildStaffSystemPrompt(persona, "midnight cabin talk");
    expect(prompt).toContain("Heart-Centered Listener");
    expect(prompt).toContain("heart-centered-listener");
    expect(prompt).toContain("Active scenario");
    expect(prompt).toContain("midnight cabin talk");
    expect(prompt).toContain("first person");
  });

  it("builds a draft reply that references the user message", () => {
    const draft = buildDraftStaffReply(
      persona,
      "My camper won't stop crying about home",
    );
    expect(draft.toLowerCase()).toContain("crying");
    expect(draft.length).toBeGreaterThan(40);
  });

  it("formats an MCP chat packet", () => {
    const packet = buildStaffChatPacket(
      persona,
      "How do I sit with a homesick teen?",
      { scenario: "first night" },
    );
    const text = formatStaffChatForMcp(packet);
    expect(text).toContain("Camp staff chat");
    expect(text).toContain(packet.draftReply);
    expect(text).toContain("System prompt");
    expect(packet.staff.id).toBe("heart-centered-listener");
  });
});

describe("camp staff mcp service", () => {
  it("lists all staff", () => {
    const list = listStaffSummaries("all");
    expect(list.count).toBe(12);
    expect(list.staff[0]).toHaveProperty("id");
  });

  it("filters by cluster", () => {
    const list = listStaffSummaries("domain");
    expect(list.count).toBe(3);
    expect(
      list.staff.every((s) => s.cluster === "By Domain Mastery"),
    ).toBe(true);
  });

  it("searches by query", () => {
    const result = searchStaff({ query: "lifeguard" });
    expect(result.count).toBeGreaterThanOrEqual(1);
    expect(result.staff.some((s) => s.id === "waterfront-sentinel")).toBe(
      true,
    );
  });

  it("returns detail and chat packets", () => {
    const detail = getStaffDetail("waterfront-sentinel");
    expect(detail.ok).toBe(true);

    const chat = chatWithStaff({
      staff_id: "waterfront-sentinel",
      message: "Kid says they can skip the swim test.",
      scenario: "dock check-in",
    });
    expect(chat.ok).toBe(true);
    if (chat.ok) {
      expect(chat.text).toContain("Waterfront Sentinel");
      expect(chat.packet.draftReply.length).toBeGreaterThan(20);
    }
  });

  it("rejects unknown staff ids", () => {
    const detail = getStaffDetail("not-a-real-staff");
    expect(detail.ok).toBe(false);
    const chat = chatWithStaff({
      staff_id: "not-a-real-staff",
      message: "hi",
    });
    expect(chat.ok).toBe(false);
  });
});
