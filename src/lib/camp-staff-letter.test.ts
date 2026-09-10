import { describe, expect, it } from "vitest";
import { PERSONAS } from "@/data/personas";
import { formatCampLetter, renderCampLetterText } from "@/lib/camp-staff-letter";

const persona = PERSONAS.find((p) => p.id === "waterfront-sentinel")!;
const question = "Kid wants to skip the swim test";
const body =
  "I hear you on that one. Before we escalate, let me grab my clipboard and talk to them at the dock.\n\nUsually when a kid dodges the swim test it's not about the swimming — it's about the audience. I pull them aside, feet in the water, no crowd.";

describe("formatCampLetter", () => {
  const letter = formatCampLetter(persona, question, body);

  it("sets fromId to the persona id", () => {
    expect(letter.fromId).toBe("waterfront-sentinel");
  });

  it("sets toId to director", () => {
    expect(letter.toId).toBe("director");
  });

  it("includes the camp letterhead", () => {
    expect(letter.letterhead).toContain("CAMP NORTHERN LIGHTS");
    expect(letter.letterhead).toContain("Staff Cabin Mail");
  });

  it("generates a postmark", () => {
    expect(letter.postmark.length).toBeGreaterThan(5);
  });

  it("addresses the envelope from the persona", () => {
    expect(letter.envelopeFrom).toContain("Waterfront Sentinel");
  });

  it("addresses the envelope to the director", () => {
    expect(letter.envelopeTo).toContain("Director");
    expect(letter.envelopeTo).toContain("Dock");
  });

  it("uses a camp salutation", () => {
    expect(letter.salutation).toContain("Dear Director");
  });

  it("preserves the reply body", () => {
    expect(letter.body).toBe(body);
  });

  it("includes a persona-specific closing", () => {
    expect(letter.closing.length).toBeGreaterThan(5);
    expect(letter.closing).toContain("water");
  });

  it("has a non-empty signature", () => {
    expect(letter.signature).toContain("Waterfront Sentinel");
    expect(letter.signature.length).toBeGreaterThan(10);
  });

  it("echoes the raw question", () => {
    expect(letter.rawQuestion).toBe(question);
  });
});

describe("renderCampLetterText", () => {
  const letter = formatCampLetter(persona, question, body);
  const text = renderCampLetterText(letter);

  it("includes letterhead, from/to, salutation, body, and closing", () => {
    expect(text).toContain(letter.letterhead);
    expect(text).toContain("FROM:");
    expect(text).toContain("TO:");
    expect(text).toContain(letter.salutation);
    expect(text).toContain(letter.closing);
    expect(text).toContain(letter.signature);
  });

  it("includes body paragraphs", () => {
    expect(text).toContain("clipboard");
    expect(text).toContain("dock");
  });

  it("includes P.S. when present", () => {
    const letterWithPs = { ...letter, ps: "Don't forget the sunscreen." };
    const withPs = renderCampLetterText(letterWithPs);
    expect(withPs).toContain("P.S. Don't forget the sunscreen.");
  });

  it("omits P.S. when not present", () => {
    expect(text).not.toContain("P.S.");
  });
});

describe("formatCampLetter covers all personas", () => {
  it("produces valid letters for every persona", () => {
    for (const p of PERSONAS) {
      const letter = formatCampLetter(p, "How are things?", "All good here.");
      expect(letter.fromId).toBe(p.id);
      expect(letter.signature.length).toBeGreaterThan(0);
      expect(letter.closing.length).toBeGreaterThan(0);
      expect(letter.envelopeFrom).toBeTruthy();
    }
  });
});
