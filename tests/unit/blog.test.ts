import { describe, expect, it } from "vitest";
import { blogPosts, formatPostDate, sortPosts, tiktokProfile, type BlogPost } from "@/data/blog";

const post = (id: string, date: string): BlogPost => ({
  id,
  title: id,
  summary: "",
  date,
  url: `https://www.tiktok.com/@someone/video/${id}`,
});

describe("blog", () => {
  it("lists newest posts first", () => {
    const posts = [post("a", "2026-01-05"), post("b", "2026-03-01"), post("c", "2025-12-31")];
    expect(sortPosts(posts).map((p) => p.id)).toEqual(["b", "a", "c"]);
  });

  it("formats the posting date without shifting the day", () => {
    expect(formatPostDate("2026-10-30")).toBe("Oct 30, 2026");
    expect(formatPostDate("2026-01-01")).toBe("Jan 1, 2026");
  });

  it("only links to TikTok over https, with unique ids and real dates", () => {
    const ids = new Set<string>();
    for (const entry of blogPosts) {
      expect(entry.url).toMatch(/^https:\/\/www\.tiktok\.com\/@[\w.]+\/video\/\d+/);
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(entry.date))).toBe(false);
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
    }
    if (tiktokProfile) expect(tiktokProfile).toMatch(/^https:\/\/www\.tiktok\.com\/@[\w.]+\/?$/);
  });
});
