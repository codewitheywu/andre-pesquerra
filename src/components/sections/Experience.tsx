import Section from "@/components/ui/Section";
import { siteContent } from "@/data/content";
import type { ExperienceItem } from "@/types/content";
import StackMarquee from "./StackMarquee";
import Timeline from "./Timeline";

export default function Experience({ experience }: { experience: ExperienceItem[] }) {
  return (
    <Section
      id="experience"
      title="Experience"
      action={{ label: "résumé", href: siteContent.resume }}
    >
      <Timeline
        entries={experience.map((item) => ({
          id: item.id,
          period: item.period,
          title: item.role,
          subtitle: item.org,
          detail: item.description,
        }))}
      />
      <div className="mt-10">
        <StackMarquee />
      </div>
    </Section>
  );
}
