// The /blog page: TikTok posts, listed and linked out. Videos are not
// embedded, because TikTok's embed script is a third-party tracker that
// would need CSP exceptions and slows the page.

export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  /** Posting date, YYYY-MM-DD. */
  date: string;
  /** The video's link, https://www.tiktok.com/@handle/video/<id>. */
  url: string;
};

// TODO: set your TikTok profile, e.g. "https://www.tiktok.com/@yourhandle".
export const tiktokProfile: string | null = null;

// TODO: add your posts. Order does not matter; the page shows newest first.
export const blogPosts: BlogPost[] = [];

/** Newest first; ties keep their written order. */
export function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

/** "2026-10-30" → "Oct 30, 2026", read as a calendar date (no time zone shift). */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
