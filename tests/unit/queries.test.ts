import { beforeEach, describe, expect, it, vi } from "vitest";
import { fallbackExperience, fallbackProjects } from "@/data/content";

vi.mock("server-only", () => ({}));

const createPublicClient = vi.fn();
vi.mock("@/lib/supabase/public", () => ({ createPublicClient }));

const { getExperience, getProjects } = await import("@/lib/queries");

/** A stand-in for the PostgREST builder: chainable, then awaitable. */
function clientResolving(result: unknown) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
  return { from: vi.fn(() => builder) };
}

function clientRejecting(error: Error) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    then: (_resolve: unknown, reject: (reason: unknown) => unknown) => reject(error),
  };
  return { from: vi.fn(() => builder) };
}

describe("queries fall back instead of breaking the page", () => {
  beforeEach(() => {
    createPublicClient.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("uses fallbacks when Supabase is not configured", async () => {
    createPublicClient.mockReturnValue(null);
    await expect(getProjects()).resolves.toEqual(fallbackProjects);
  });

  it("uses fallbacks when the query returns an error", async () => {
    createPublicClient.mockReturnValue(
      clientResolving({ data: null, error: { message: "relation does not exist" } })
    );
    await expect(getProjects()).resolves.toEqual(fallbackProjects);
    expect(console.error).toHaveBeenCalledWith(
      "Could not load projects from Supabase:",
      "relation does not exist"
    );
  });

  it("uses fallbacks when the network call throws (Supabase down)", async () => {
    createPublicClient.mockReturnValue(clientRejecting(new TypeError("fetch failed")));
    await expect(getExperience()).resolves.toEqual(fallbackExperience);
  });

  it("uses fallbacks when the table is empty", async () => {
    createPublicClient.mockReturnValue(clientResolving({ data: [], error: null }));
    await expect(getProjects()).resolves.toEqual(fallbackProjects);
  });

  it("uses fallbacks when every row is invalid, and reports it", async () => {
    createPublicClient.mockReturnValue(
      clientResolving({ data: [{ id: 1, title: null }], error: null })
    );
    await expect(getProjects()).resolves.toEqual(fallbackProjects);
    expect(console.error).toHaveBeenCalledWith("Skipped 1 invalid projects row(s).");
  });

  it("returns mapped rows when the database has valid content", async () => {
    createPublicClient.mockReturnValue(
      clientResolving({
        data: [
          {
            id: "9f0c",
            title: "DevBoard",
            summary: "Kanban board",
            role: "Developer",
            year: 2026,
            live_url: "https://example.com",
            project_technologies: [{ technologies: { name: "Next.js", sort_order: 1 } }],
          },
        ],
        error: null,
      })
    );

    await expect(getProjects()).resolves.toEqual([
      {
        id: "9f0c",
        title: "DevBoard",
        summary: "Kanban board",
        role: "Developer",
        stack: ["Next.js"],
        year: "2026",
        liveUrl: "https://example.com/",
      },
    ]);
  });
});
