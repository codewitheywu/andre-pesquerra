import { describe, expect, it } from "vitest";
import { behindTheCode, hasBehindContent, type BehindTheCode } from "@/data/behind";

const empty: BehindTheCode = { intro: "", story: [], life: [], hobbies: [] };

describe("behind the code", () => {
  it("counts the page as unwritten until a section has content", () => {
    expect(hasBehindContent(empty)).toBe(false);
    expect(hasBehindContent({ ...empty, intro: "   " })).toBe(false);
    expect(hasBehindContent({ ...empty, intro: "Hi." })).toBe(true);
    expect(hasBehindContent({ ...empty, hobbies: [{ name: "Chess", note: "" }] })).toBe(true);
  });

  it("has no blank paragraphs or duplicate hobbies (React keys)", () => {
    for (const text of [...behindTheCode.story, ...behindTheCode.life]) {
      expect(text.trim()).not.toBe("");
    }
    const names = behindTheCode.hobbies.map((hobby) => hobby.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
