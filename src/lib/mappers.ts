import { z } from "zod";
import type { ExperienceItem, Project } from "@/types/content";

// Rows arrive from the network as untrusted data: each one is validated
// before it reaches the UI. Regenerate src/types/database.ts with
// `npm run db:types` to also get compile-time types on the client.

const optionalText = z.string().nullish();
const optionalDate = z.iso.date().nullish();

export const projectRowSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  summary: optionalText,
  role: optionalText,
  year: z.number().int().nullish(),
  live_url: optionalText,
  project_technologies: z
    .array(
      z.object({
        technologies: z
          .object({ name: z.string(), sort_order: z.number().nullish() })
          .nullable(),
      })
    )
    .nullish(),
});

export const experienceRowSchema = z.object({
  id: z.string(),
  organization: z.string(),
  position: z.string(),
  description: optionalText,
  start_date: optionalDate,
  end_date: optionalDate,
  is_current: z.boolean().nullish(),
});

export type ProjectRow = z.infer<typeof projectRowSchema>;
export type ExperienceRow = z.infer<typeof experienceRowSchema>;

export function formatPeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isCurrent = false
): string {
  if (!startDate) {
    return "";
  }

  const startYear = startDate.slice(0, 4);
  const endYear = endDate ? endDate.slice(0, 4) : isCurrent ? "Present" : "";

  if (!endYear || startYear === endYear) {
    return startYear;
  }

  return `${startYear} – ${endYear}`;
}

/** Return the URL only if it is an absolute http(s) link. */
export function toSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function mapProject(row: ProjectRow): Project {
  const stack = (row.project_technologies ?? [])
    .map((link) => link.technologies)
    .filter((technology) => technology !== null)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((technology) => technology.name);

  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    role: row.role ?? "",
    stack,
    year: row.year ? String(row.year) : null,
    liveUrl: toSafeExternalUrl(row.live_url),
  };
}

export function mapExperience(row: ExperienceRow): ExperienceItem {
  return {
    id: row.id,
    role: row.position,
    org: row.organization,
    period: formatPeriod(row.start_date, row.end_date, row.is_current ?? false),
    description: row.description ?? "",
  };
}

/**
 * Validate rows one by one and keep the valid ones, so a single bad row
 * hides only itself instead of the whole section.
 */
export function parseRows<Row, Item>(
  data: unknown,
  schema: z.ZodType<Row>,
  map: (row: Row) => Item
): { items: Item[]; invalid: number } {
  if (!Array.isArray(data)) {
    return { items: [], invalid: 0 };
  }

  const items: Item[] = [];
  let invalid = 0;

  for (const value of data) {
    const result = schema.safeParse(value);

    if (result.success) {
      items.push(map(result.data));
    } else {
      invalid += 1;
    }
  }

  return { items, invalid };
}
