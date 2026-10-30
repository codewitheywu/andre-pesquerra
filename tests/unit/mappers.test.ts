import { describe, expect, it } from "vitest";
import {
  experienceRowSchema,
  formatPeriod,
  mapExperience,
  mapProject,
  parseRows,
  projectRowSchema,
  toSafeExternalUrl,
} from "@/lib/mappers";

describe("formatPeriod", () => {
  it("returns an empty label without a start date", () => {
    expect(formatPeriod(null, null)).toBe("");
  });

  it("collapses a single-year range", () => {
    expect(formatPeriod("2025-02-01", "2025-11-30")).toBe("2025");
  });

  it("formats a multi-year range", () => {
    expect(formatPeriod("2023-06-01", "2025-03-01")).toBe("2023 – 2025");
  });

  it("marks current roles as present", () => {
    expect(formatPeriod("2024-01-01", null, true)).toBe("2024 – Present");
  });

  it("shows only the start year for an open, non-current entry", () => {
    expect(formatPeriod("2024-01-01", null)).toBe("2024");
  });
});

describe("toSafeExternalUrl", () => {
  it("keeps http and https links", () => {
    expect(toSafeExternalUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(toSafeExternalUrl("http://example.com")).toBe("http://example.com/");
  });

  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/relative/path",
    "not a url",
    "",
    null,
    undefined,
  ])("rejects %s", (value) => {
    expect(toSafeExternalUrl(value)).toBeNull();
  });
});

describe("mapProject", () => {
  it("orders technologies and drops missing joins", () => {
    const project = mapProject({
      id: "p1",
      title: "Revolution",
      summary: null,
      role: "Solo PBBG Developer",
      year: 2026,
      live_url: "javascript:alert(1)",
      project_technologies: [
        { technologies: { name: "MySQL", sort_order: 2 } },
        { technologies: null },
        { technologies: { name: "PHP", sort_order: 1 } },
      ],
    });

    expect(project).toEqual({
      id: "p1",
      title: "Revolution",
      summary: "",
      role: "Solo PBBG Developer",
      stack: ["PHP", "MySQL"],
      year: "2026",
      liveUrl: null,
    });
  });
});

describe("mapExperience", () => {
  it("maps schema columns to UI fields", () => {
    expect(
      mapExperience({
        id: "e1",
        organization: "SBMA",
        position: "Intern",
        description: null,
        start_date: "2025-01-15",
        end_date: "2025-04-15",
        is_current: false,
      })
    ).toEqual({
      id: "e1",
      role: "Intern",
      org: "SBMA",
      period: "2025",
      description: "",
    });
  });
});

describe("parseRows", () => {
  it("returns nothing for non-array data", () => {
    expect(parseRows(null, projectRowSchema, mapProject)).toEqual({
      items: [],
      invalid: 0,
    });
  });

  it("keeps valid rows and counts invalid ones", () => {
    const { items, invalid } = parseRows(
      [
        { id: "e1", organization: "A", position: "Dev" },
        { id: "e2", organization: "B" },
        { id: "e3", organization: "C", position: "QA", start_date: "not-a-date" },
      ],
      experienceRowSchema,
      mapExperience
    );

    expect(items.map((item) => item.id)).toEqual(["e1"]);
    expect(invalid).toBe(2);
  });

  it("rejects projects with an empty title", () => {
    const { invalid } = parseRows([{ id: "p", title: "" }], projectRowSchema, mapProject);
    expect(invalid).toBe(1);
  });
});
