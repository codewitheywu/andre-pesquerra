import { z } from "zod";

// Shape of github-contributions-api.jogruber.de/v4/<user>?y=last, which
// reads the public contribution calendar from GitHub's profile page.
export const contributionResponseSchema = z.object({
  contributions: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      count: z.number().int().nonnegative(),
      level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    })
  ),
});

export type ContributionDay = z.infer<typeof contributionResponseSchema>["contributions"][number];

export type ContributionCalendar = {
  /** Columns of seven days, Sunday first; null where the range has no day. */
  weeks: (ContributionDay | null)[][];
  /** Month names placed on the column holding that month's first day. */
  months: { label: string; week: number }[];
  total: number;
  activeDays: number;
  busiest: ContributionDay | null;
};

const DAY_MS = 86_400_000;
// A month label is about three columns wide; one starting closer to the
// right edge than this would be clipped.
const LABEL_WEEKS = 3;

const monthFormat = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const dayNumber = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS);

export function formatDay(date: string): string {
  return dayFormat.format(new Date(`${date}T00:00:00Z`));
}

/** Lay days out as GitHub does: one column per week, one row per weekday. */
export function buildCalendar(days: ContributionDay[]): ContributionCalendar {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const columns: (ContributionDay | null)[][] = [];

  if (first) {
    const firstDay = dayNumber(first.date);
    // Day 0 of the Unix epoch was a Thursday (weekday 4).
    const start = firstDay - ((firstDay + 4) % 7);
    for (const day of sorted) {
      const offset = dayNumber(day.date) - start;
      const week = Math.floor(offset / 7);
      columns[week] ??= Array<ContributionDay | null>(7).fill(null);
      columns[week][offset % 7] = day;
    }
  }

  const weeks = Array.from(
    { length: columns.length },
    (_, index) => columns[index] ?? Array<ContributionDay | null>(7).fill(null)
  );

  const months: ContributionCalendar["months"] = [];
  weeks.forEach((week, index) => {
    const firstOfMonth = week.find((day) => day?.date.endsWith("-01"));
    if (!firstOfMonth || index > weeks.length - LABEL_WEEKS) return;
    months.push({
      label: monthFormat.format(new Date(`${firstOfMonth.date}T00:00:00Z`)),
      week: index,
    });
  });

  let total = 0;
  let activeDays = 0;
  let busiest: ContributionDay | null = null;
  for (const day of sorted) {
    total += day.count;
    if (day.count > 0) activeDays += 1;
    if (day.count > (busiest?.count ?? 0)) busiest = day;
  }

  return { weeks, months, total, activeDays, busiest };
}
