import type { Metadata } from "next";
import Link from "next/link";
import TextLink from "@/components/ui/TextLink";
import { siteContent } from "@/data/content";
import { blogPosts, formatPostDate, sortPosts, tiktokProfile, type BlogPost } from "@/data/blog";

const description = "Andre Pesquerra's TikTok posts, collected in one place.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: siteContent.name,
    title: `Blog — ${siteContent.name}`,
    description,
    images: [siteContent.ogImage],
  },
};

function PostRow({ post }: { post: BlogPost }) {
  return (
    <li>
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="-mx-3 block rounded-md px-3 py-5 transition-colors hover:bg-surface-2"
      >
        <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
          <span className="text-lead font-medium text-ink">
            {post.title}
            <span aria-hidden="true" className="nudge nudge-up ml-2 text-muted">
              ↗
            </span>
          </span>
          <span aria-hidden="true" className="leader hidden flex-1 self-center sm:block" />
          <time
            dateTime={post.date}
            className="order-first shrink-0 font-mono text-meta text-muted sm:order-0"
          >
            {formatPostDate(post.date)}
          </time>
        </span>
        {post.summary && <span className="mt-1 block text-body text-ink-2">{post.summary}</span>}
        <span className="sr-only"> (watch on TikTok, opens in a new tab)</span>
      </a>
    </li>
  );
}

export default function BlogPage() {
  const posts = sortPosts(blogPosts);

  return (
    <div className="pb-8 pt-10 lg:pt-24">
      <Link
        href="/"
        className="press inline-flex min-h-11 items-center gap-1.5 font-mono text-meta text-muted transition-colors hover:text-ink lg:min-h-6"
      >
        <span aria-hidden="true">←</span>
        back home
      </Link>

      <h1 className="mt-6 text-h2 font-semibold text-ink sm:text-h1">Blog</h1>
      <p className="mt-4 max-w-136 text-lead text-ink-2">
        My TikTok posts, collected in one place. Each one opens on TikTok.
      </p>

      <section aria-labelledby="posts-heading" className="mt-16">
        <div className="mb-2 flex items-center gap-3">
          <h2 id="posts-heading" className="text-h3 font-semibold text-ink">
            Posts
          </h2>
          <span aria-hidden="true" className="leader flex-1" />
          {tiktokProfile && (
            <TextLink
              href={tiktokProfile}
              className="inline-flex min-h-11 items-center font-mono text-meta lowercase lg:min-h-6"
            >
              tiktok
            </TextLink>
          )}
        </div>

        {posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 max-w-136 text-body text-ink-2">
            The first posts are on their way.{" "}
            {tiktokProfile ? (
              <>
                Until they land here, you can find me on{" "}
                <span className="whitespace-nowrap"><TextLink href={tiktokProfile}>TikTok</TextLink>.</span>
              </>
            ) : (
              <>
                In the meantime, my code is on{" "}
                <span className="whitespace-nowrap"><TextLink href={siteContent.github}>GitHub</TextLink>.</span>
              </>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
