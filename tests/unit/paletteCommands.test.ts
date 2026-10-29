import { describe, expect, it } from "vitest";
import { COMMANDS, filterCommands } from "@/components/layout/paletteCommands";
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
    expect(filterCommands("EDU").map((c) => c.label)).toEqual(["Education"]);
    expect(filterCommands("cv").map((c) => c.id)).toEqual(["resume"]);
    expect(filterCommands("mail").map((c) => c.id)).toEqual(["copy-email"]);
  });

  it("returns nothing for unknown terms", () => {
    expect(filterCommands("zzzz")).toEqual([]);
  });

  it("only links to absolute https URLs or the local résumé", () => {
    for (const command of COMMANDS.filter((c) => c.group === "Links")) {
      expect(command.target).toMatch(/^(https:\/\/|\/files\/)/);
    }
  });
});
