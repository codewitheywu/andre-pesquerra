import Section from "@/components/ui/Section";
import { certifications } from "@/data/content";
import Timeline from "./Timeline";

export default function Certifications() {
  return (
    <Section id="certifications" index={4} title="certifications">
      <Timeline
        entries={certifications.map((item) => ({
          id: item.id,
          period: item.period,
          title: item.name,
          subtitle: item.issuer,
          detail: "",
        }))}
      />
    </Section>
  );
}
