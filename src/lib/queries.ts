import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import {
  fallbackExperience,
  fallbackProjects,
} from "@/data/content";
import {
  experienceRowSchema,
  mapExperience,
  mapProject,
  mapRecommendation,
  parseRows,
  projectRowSchema,
  testimonialRowSchema,
} from "@/lib/mappers";
import { createPublicClient } from "@/lib/supabase/public";
import type { ExperienceItem, Project, Recommendation } from "@/types/content";

type QueryResult = PromiseLike<{
  data: unknown;
  error: { message: string } | null;
}>;

/**
 * Read a public table and fall back to static content when Supabase is not
 * configured, the query fails, or no valid rows come back. Failures are
 * logged on the server; visitors always see a complete page.
 */
async function queryWithFallback<Row, Item>(
  label: string,
  runQuery: (supabase: SupabaseClient) => QueryResult,
  schema: z.ZodType<Row>,
  map: (row: Row) => Item,
  fallback: Item[]
): Promise<Item[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return fallback;
  }

  try {
    const { data, error } = await runQuery(supabase);

    if (error) {
      console.error(`Could not load ${label} from Supabase:`, error.message);
      return fallback;
    }

    const { items, invalid } = parseRows(data, schema, map);

    if (invalid > 0) {
      console.error(`Skipped ${invalid} invalid ${label} row(s).`);
    }

    return items.length > 0 ? items : fallback;
  } catch (error) {
    console.error(`Unexpected error loading ${label}:`, error);
    return fallback;
  }
}

export function getProjects(): Promise<Project[]> {
  return queryWithFallback(
    "projects",
    (supabase) =>
      supabase
        .from("projects")
        .select(
          "id, title, summary, role, year, live_url, project_technologies(technologies(name, sort_order))"
        )
        .eq("published", true)
        .order("sort_order", { ascending: true }),
    projectRowSchema,
    mapProject,
    fallbackProjects
  );
}

export function getExperience(): Promise<ExperienceItem[]> {
  return queryWithFallback(
    "experience",
    (supabase) =>
      supabase
        .from("experience")
        .select(
          "id, organization, position, description, start_date, end_date, is_current"
        )
        .order("sort_order", { ascending: true }),
    experienceRowSchema,
    mapExperience,
    fallbackExperience
  );
}

/**
 * Published recommendations only (RLS hides the rest), newest first. There
 * is no static fallback: a recommendation is only shown if a real person
 * gave it. The home page asks for the latest few, /recommendations for all.
 */
export function getRecommendations(limit = 100): Promise<Recommendation[]> {
  return queryWithFallback(
    "recommendations",
    (supabase) =>
      supabase
        .from("testimonials")
        .select("id, person_name, person_role, organization, quote")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(limit),
    testimonialRowSchema,
    mapRecommendation,
    []
  );
}
