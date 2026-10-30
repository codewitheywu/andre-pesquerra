import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { getContributions } = await import("@/lib/github");

function respond(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("getContributions", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("builds the calendar from a valid response, cached for an hour", async () => {
    const fetchMock = respond({
      total: { lastYear: 4 },
      contributions: [
        { date: "2025-11-02", count: 1, level: 1 },
        { date: "2025-11-03", count: 3, level: 3 },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const calendar = await getContributions("octo cat");

    expect(calendar?.total).toBe(4);
    expect(calendar?.busiest?.date).toBe("2025-11-03");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit & { next: unknown }];
    // The username is encoded, never spliced raw into the URL.
    expect(url).toBe("https://github-contributions-api.jogruber.de/v4/octo%20cat?y=last");
    expect(init.next).toEqual({ revalidate: 3600 });
  });

  it.each([
    ["an HTTP error", () => respond({ error: "not found" }, 404)],
    ["an unexpected shape", () => respond({ contributions: [{ date: "yesterday" }] })],
    ["invalid JSON", () => vi.fn(async () => new Response("<html>", { status: 200 }))],
    ["a network failure", () => vi.fn(async () => Promise.reject(new TypeError("fetch failed")))],
  ])("returns null and logs on %s", async (_case, makeFetch) => {
    vi.stubGlobal("fetch", makeFetch());

    await expect(getContributions("codewitheywu")).resolves.toBeNull();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("[github] contributions unavailable"));
  });
});
