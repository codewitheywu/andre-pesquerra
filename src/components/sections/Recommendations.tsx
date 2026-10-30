import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { siteContent } from "@/data/content";
import type { Recommendation } from "@/types/content";

/**
 * Words from people Andre has worked with, published from the
 * `testimonials` table. Until the first one arrives the section asks for
 * one instead of showing anything made up.
 */
export default function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <Section
      id="recommendations"
      title="Recommendations"
      action={{ label: "linkedin", href: siteContent.linkedin }}
    >
      {recommendations.length > 0 ? (
        <ul className="space-y-10">
          {recommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <figure className="border-l border-border pl-5">
                <blockquote className="text-lead text-ink">
                  <p>&ldquo;{recommendation.quote}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-3 font-mono text-meta text-muted">
                  <span className="text-ink-2">{recommendation.name}</span>
                  {recommendation.credit && <> · {recommendation.credit}</>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <p className="max-w-136 text-body text-ink-2">
          No recommendations here yet. If we&apos;ve worked or studied together, or you&apos;ve
          taken one of my classes, a few words would mean a lot: on{" "}
          <TextLink href={siteContent.linkedin}>LinkedIn</TextLink> or by{" "}
          <span className="whitespace-nowrap">
            <a href={`mailto:${siteContent.email}`} className="link-draw text-ink-2 hover:text-ink">
              email
            </a>
            .
          </span>
        </p>
      )}
    </Section>
  );
}
