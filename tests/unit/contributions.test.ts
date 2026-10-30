import { describe, expect, it } from "vitest";
import {
  buildCalendar,
  contributionResponseSchema,
  formatDay,
  type ContributionDay,
} from "@/lib/contributions";

function day(date: string, count = 0, level: ContributionDay["level"] = 0): ContributionDay {
  return { date, count, level };
}

/** Consecutive days starting at `start`, all with zero contributions. */
function range(start: string, length: number): ContributionDay[] {
  const first = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length }, (_, index) =>
    day(new Date(first + index * 86_400_000).toISOString().slice(0, 10))
  );
}

describe("buildCalendar", () => {
  it("puts each day on its weekday row, Sunday first", () => {
    // 2025-10-29 is a Wednesday.
    const calendar = buildCalendar(range("2025-10-29", 5));
    expect(calendar.weeks).toHaveLength(2);
    expect(calendar.weeks[0]?.slice(0, 3)).toEqual([null, null, null]);
    expect(calendar.weeks[0]?.[3]?.date).toBe("2025-10-29");
    expect(calendar.weeks[1]?.[0]?.date).toBe("2025-11-02");
  });

  it("keeps the grid aligned when days are missing", () => {
    const calendar = buildCalendar([day("2025-11-02"), day("2025-11-20")]);
    expect(calendar.weeks).toHaveLength(3);
    expect(calendar.weeks[1]).toEqual(Array(7).fill(null));
    expect(calendar.weeks[2]?.[4]?.date).toBe("2025-11-20");
  });

  it("sorts unordered input", () => {
    const calendar = buildCalendar([day("2025-11-04"), day("2025-11-02")]);
    expect(calendar.weeks[0]?.[0]?.date).toBe("2025-11-02");
    expect(calendar.weeks[0]?.[2]?.date).toBe("2025-11-04");
  });

  it("labels months on the week of their 1st day", () => {
    // Starts mid-November: Dec 1 is in week 2, Jan 1 in week 6.
    const calendar = buildCalendar(range("2025-11-16", 60));
    expect(calendar.months).toEqual([
      { label: "Dec", week: 2 },
      { label: "Jan", week: 6 },
    ]);
  });

  it("drops a month label that would be clipped at the right edge", () => {
    // Weeks 0-4; Dec 1 lands in week 2, two columns from the end.
    const calendar = buildCalendar(range("2025-11-16", 32));
    expect(calendar.weeks).toHaveLength(5);
    expect(calendar.months).toEqual([{ label: "Dec", week: 2 }]);

    // Dec 1 in the last column: no room for "Dec".
    const tight = buildCalendar(range("2025-11-16", 16));
    expect(tight.weeks).toHaveLength(3);
    expect(tight.months).toEqual([]);
  });

  it("totals contributions and finds the busiest day", () => {
    const calendar = buildCalendar([
      day("2025-11-02", 3, 2),
      day("2025-11-03", 0),
      day("2025-11-04", 7, 4),
      day("2025-11-05", 7, 4),
    ]);
    expect(calendar.total).toBe(17);
    expect(calendar.activeDays).toBe(3);
    // The first of equally busy days wins.
    expect(calendar.busiest?.date).toBe("2025-11-04");
  });

  it("handles an empty or idle year", () => {
    expect(buildCalendar([])).toEqual({
      weeks: [],
      months: [],
      total: 0,
      activeDays: 0,
      busiest: null,
    });
    expect(buildCalendar(range("2025-11-02", 7)).busiest).toBeNull();
  });
});

describe("contributionResponseSchema", () => {
  it("accepts the API shape and rejects bad rows", () => {
    const valid = { total: { lastYear: 1 }, contributions: [day("2025-11-02", 1, 1)] };
    expect(contributionResponseSchema.safeParse(valid).success).toBe(true);

    for (const bad of [
      { contributions: [{ date: "11/02/2025", count: 1, level: 1 }] },
      { contributions: [{ date: "2025-11-02", count: -1, level: 1 }] },
      { contributions: [{ date: "2025-11-02", count: 1, level: 5 }] },
      { contributions: "nope" },
    ]) {
      expect(contributionResponseSchema.safeParse(bad).success).toBe(false);
    }
  });
});

describe("formatDay", () => {
  it("formats in UTC regardless of the server time zone", () => {
    expect(formatDay("2025-11-02")).toBe("Sun, Nov 2, 2025");
  });
});
