import Section from "@/components/ui/Section";
import { siteContent } from "@/data/content";
import type { ExperienceItem } from "@/types/content";
import StackMarquee from "./StackMarquee";

/**
 * One line per role: year, role, organisation. The details live in the
 * résumé. The role always shows in full; a long organisation name gives way
 * with an ellipsis (full text on hover and for screen readers). Phones stack
 * the organisation under the role.
 */
export default function Experience({ experience }: { experience: ExperienceItem[] }) {
  return (
    <Section
      id="experience"
      title="Experience"
      action={{ label: "full history", href: siteContent.resume }}
    >
      <ol className="border-t border-border">
        {experience.map((item) => (
          <li key={item.id} className="flex items-baseline gap-4 border-b border-border py-3.5 sm:gap-6">
            <span className="w-22 shrink-0 font-mono text-meta lowercase text-muted">{item.period}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-6">
              <h3 className="text-body font-medium tracking-normal text-ink sm:shrink-0">{item.role}</h3>
              <p title={item.org} className="min-w-0 text-body text-ink-2 sm:ml-auto sm:truncate sm:text-right">
                {item.org}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <StackMarquee />
      </div>
    </Section>
  );
}
