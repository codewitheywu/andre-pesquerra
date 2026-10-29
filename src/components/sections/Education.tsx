import Section from "@/components/ui/Section";
import type { EducationItem } from "@/types/content";
import Timeline from "./Timeline";

export default function Education({ education }: { education: EducationItem[] }) {
  return (
    <Section id="education" index={3} title="education">
      <Timeline
        entries={education.map((item) => ({
          id: item.id,
          period: item.period,
          title: item.qualification,
          subtitle: item.institution,
          detail: item.details,
        }))}
      />
    </Section>
  );
}
