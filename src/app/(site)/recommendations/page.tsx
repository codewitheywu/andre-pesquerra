import type { Metadata } from "next";
import Link from "next/link";
import RecommendationList from "@/components/sections/RecommendationList";
import { siteContent } from "@/data/content";
import { getRecommendations } from "@/lib/queries";

// New recommendations show up within a minute of being published.
export const revalidate = 60;

const description = "What clients, colleagues and students say about working with Andre Pesquerra.";

export const metadata: Metadata = {
  title: "Recommendations",
  description,
  alternates: { canonical: "/recommendations" },
  openGraph: {
    type: "website",
    url: "/recommendations",
    siteName: siteContent.name,
    title: `Recommendations — ${siteContent.name}`,
    description,
    images: [siteContent.ogImage],
  },
};

export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();

  return (
    <div className="pb-8 pt-10 lg:pt-24">
      <Link
        href="/#recommendations"
        className="press inline-flex min-h-11 items-center gap-1.5 font-mono text-meta text-muted transition-colors hover:text-ink lg:min-h-6"
      >
        <span aria-hidden="true">←</span>
        back home
      </Link>

      <h1 className="mt-6 text-h2 font-semibold text-ink sm:text-h1">Recommendations</h1>
      <p className="mt-4 max-w-136 text-lead text-ink-2">
        What clients, colleagues and students have said about working with me, newest first.
      </p>

      <section aria-labelledby="all-recommendations-heading" className="mt-16">
        <div className="mb-6 flex items-center gap-3">
          <h2 id="all-recommendations-heading" className="text-h3 font-semibold text-ink">
            All recommendations
          </h2>
          <span aria-hidden="true" className="leader flex-1" />
          {recommendations.length > 0 && (
            <span className="shrink-0 font-mono text-meta text-muted">{recommendations.length}</span>
          )}
        </div>
        <RecommendationList recommendations={recommendations} />
      </section>
    </div>
  );
}
