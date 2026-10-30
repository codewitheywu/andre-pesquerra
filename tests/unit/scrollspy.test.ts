import { describe, expect, it } from "vitest";
import { pickCurrentSection } from "@/lib/scrollspy";

const sections = (...tops: number[]) =>
  ["projects", "experience", "github", "certifications", "contact"].slice(0, tops.length).map((id, i) => ({
    id,
    top: tops[i]!,
  }));

describe("pickCurrentSection", () => {
  it("is nothing above the first section (the hero)", () => {
    expect(pickCurrentSection(sections(700, 1500, 2300), 320, false)).toBeNull();
  });

  it("is the last section whose top passed the reading line", () => {
    expect(pickCurrentSection(sections(-900, -100, 300, 900), 320, false)).toBe("github");
    expect(pickCurrentSection(sections(-900, -100, 330, 900), 320, false)).toBe("experience");
  });

  it("is the last section at the bottom of the page, even if it never reached the line", () => {
    expect(pickCurrentSection(sections(-2000, -1200, -500, 200, 600), 320, true)).toBe("contact");
  });

  it("is nothing when the page has no sections", () => {
    expect(pickCurrentSection([], 320, true)).toBeNull();
  });
});
