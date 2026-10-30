import "server-only";

import {
  buildCalendar,
  contributionResponseSchema,
  type ContributionCalendar,
} from "@/lib/contributions";

const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

/**
 * The last year of public GitHub contributions, cached for an hour.
 * Returns null when the service is down or answers in an unexpected
 * shape; the section then links to the profile instead.
 */
export async function getContributions(username: string): Promise<ContributionCalendar | null> {
  try {
    const response = await fetch(
      `${CONTRIBUTIONS_API}/${encodeURIComponent(username)}?y=last`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const parsed = contributionResponseSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error("unexpected response shape");

    return buildCalendar(parsed.data.contributions);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[github] contributions unavailable: ${reason}`);
    return null;
  }
}
