import { describe, expect, it } from "vitest";
import { COMMANDS, filterCommands, isSitePage } from "@/components/layout/paletteCommands";
import { navigationItems } from "@/data/content";

describe("command palette commands", () => {
  it("offers a jump for every navigation section", () => {
    const jumps = COMMANDS.filter((command) => command.group === "Jump to").map((c) => c.target);
    expect(jumps).toEqual(navigationItems.map((item) => item.href.slice(1)));
  });

  it("returns everything for an empty or blank query", () => {
    expect(filterCommands("")).toEqual(COMMANDS);
    expect(filterCommands("   ")).toEqual(COMMANDS);
  });

  it("matches labels case-insensitively and keywords", () => {
    expect(filterCommands("CERT").map((c) => c.label)).toEqual(["Certifications"]);
    expect(filterCommands("skills").map((c) => c.id)).toEqual(["stack-page"]);
    expect(filterCommands("cv").map((c) => c.id)).toEqual(["resume"]);
    expect(filterCommands("mail").map((c) => c.id)).toEqual(["copy-email"]);
    expect(filterCommands("dark").map((c) => c.id)).toEqual(["theme-dark"]);
    expect(filterCommands("coffee").map((c) => c.id)).toEqual(["theme-light", "theme-dark"]);
    expect(filterCommands("mute").map((c) => c.id)).toEqual(["sound"]);
  });

  it("returns nothing for unknown terms", () => {
    expect(filterCommands("zzzz")).toEqual([]);
  });

  it("opens site pages in place and everything else in a new tab", () => {
    expect(isSitePage("/stack")).toBe(true);
    expect(isSitePage("/files/resume.pdf")).toBe(false);
    expect(isSitePage("https://github.com/codewitheywu")).toBe(false);
    // Protocol-relative URLs leave the site.
    expect(isSitePage("//evil.example")).toBe(false);
  });

  it("only links to absolute https URLs, the local résumé or site pages", () => {
    for (const command of COMMANDS.filter((c) => c.group === "Links")) {
      expect(command.target).toMatch(/^(https:\/\/|\/files\/|\/stack$)/);
    }
  });
});
