import Section from "@/components/ui/Section";
import { siteContent } from "@/data/content";
import type { Recommendation } from "@/types/content";
import RecommendationList from "./RecommendationList";

/** How many of the newest recommendations the home page shows. */
export const HOME_RECOMMENDATIONS = 3;

/**
 * The latest words from people Andre has worked with (the `testimonials`
 * table); the rest live on /recommendations. Until the first one arrives
 * the section asks for one instead of showing anything made up.
 */
export default function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <Section
      id="recommendations"
      title="Recommendations"
      action={
        recommendations.length > 0
          ? { label: "all recommendations", href: "/recommendations" }
          : { label: "linkedin", href: siteContent.linkedin }
      }
    >
      <RecommendationList recommendations={recommendations} />
    </Section>
  );
}
