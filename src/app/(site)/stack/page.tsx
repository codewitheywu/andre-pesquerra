import type { Metadata } from "next";
import Link from "next/link";
import { siteContent } from "@/data/content";
import { stackCategories } from "@/data/stack";

const description =
  "The languages, frameworks and tools Andre Pesquerra builds with, from the interface down to the database.";

export const metadata: Metadata = {
  title: "Stack",
  description,
  alternates: { canonical: "/stack" },
  openGraph: {
    type: "website",
    url: "/stack",
    siteName: siteContent.name,
    title: `Stack — ${siteContent.name}`,
    description,
    images: [siteContent.ogImage],
  },
};

export default function StackPage() {
  return (
    <div className="pb-8 pt-10 lg:pt-24">
      <Link
        href="/#experience"
        className="press inline-flex min-h-11 items-center gap-1.5 font-mono text-meta text-muted transition-colors hover:text-ink lg:min-h-0"
      >
        <span aria-hidden="true">←</span>
        back to experience
      </Link>

      <h1 className="mt-6 text-h2 font-semibold text-ink sm:text-h1">Stack</h1>
      <p className="mt-4 max-w-136 text-lead text-ink-2">
        The languages, frameworks and tools I build with, from the interface
        down to the database.
      </p>

      <div className="mt-16 space-y-12">
        {stackCategories.map((category, index) => {
          const headingId = `stack-${index}`;
          return (
            <section key={category.label} aria-labelledby={headingId}>
              <div className="mb-4 flex items-center gap-3">
                <h2 id={headingId} className="text-h3 font-semibold text-ink">
                  {category.label}
                </h2>
                <span aria-hidden="true" className="leader flex-1" />
                <span className="shrink-0 font-mono text-meta text-muted">
                  {category.tools.length}
                  {/* Phones show the bare count, like a price on a menu. */}
                  <span className="max-sm:sr-only"> {category.tools.length === 1 ? "tool" : "tools"}</span>
                </span>
              </div>
              <ul className="flex flex-wrap gap-2.5">
                {category.tools.map((tool) => (
                  <li
                    key={tool.name}
                    className="rounded-md border border-border bg-surface px-3.5 py-2 font-mono text-meta text-ink-2"
                  >
                    {tool.name}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
