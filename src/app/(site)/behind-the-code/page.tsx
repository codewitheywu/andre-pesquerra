import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { behindTheCode, hasBehindContent } from "@/data/behind";
import { siteContent } from "@/data/content";

const description = "Andre Pesquerra's story, life and hobbies outside of code.";

export const metadata: Metadata = {
  title: "Behind the Code",
  description,
  alternates: { canonical: "/behind-the-code" },
  openGraph: {
    type: "website",
    url: "/behind-the-code",
    siteName: siteContent.name,
    title: `Behind the Code — ${siteContent.name}`,
    description,
    images: [siteContent.ogImage],
  },
};

function Part({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-5 flex items-center gap-3">
        <h2 id={id} className="text-h3 font-semibold text-ink">
          {title}
        </h2>
        <span aria-hidden="true" className="leader flex-1" />
      </div>
      {children}
    </section>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="max-w-136 space-y-4 text-body text-ink-2">
      {items.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  );
}

export default function BehindTheCodePage() {
  const { intro, story, life, hobbies } = behindTheCode;

  return (
    <div className="pb-8 pt-10 lg:pt-24">
      <Link
        href="/"
        className="press inline-flex min-h-11 items-center gap-1.5 font-mono text-meta text-muted transition-colors hover:text-ink lg:min-h-6"
      >
        <span aria-hidden="true">←</span>
        back home
      </Link>

      <h1 className="mt-6 text-h2 font-semibold text-ink sm:text-h1">Behind the Code</h1>
      <p className="mt-4 max-w-136 text-lead text-ink-2">
        {intro || "The story, the life and the hobbies outside of the work."}
      </p>

      {hasBehindContent(behindTheCode) ? (
        <div className="mt-16 space-y-14">
          {story.length > 0 && (
            <Part id="story-heading" title="Story">
              <Paragraphs items={story} />
            </Part>
          )}
          {life.length > 0 && (
            <Part id="life-heading" title="Life">
              <Paragraphs items={life} />
            </Part>
          )}
          {hobbies.length > 0 && (
            <Part id="hobbies-heading" title="Hobbies">
              <ul className="space-y-5">
                {hobbies.map((hobby) => (
                  <li key={hobby.name}>
                    <h3 className="text-body font-medium tracking-normal text-ink">{hobby.name}</h3>
                    {hobby.note && <p className="max-w-136 text-body text-ink-2">{hobby.note}</p>}
                  </li>
                ))}
              </ul>
            </Part>
          )}
        </div>
      ) : (
        <p className="mt-16 max-w-136 text-body text-ink-2">
          This page is still being written. Until then, the{" "}
          <Link href="/#experience" className="link-draw text-ink">
            experience
            <span aria-hidden="true" className="nudge ml-1">
              →
            </span>
          </Link>{" "}
          section has the working side of the story.
        </p>
      )}
    </div>
  );
}
