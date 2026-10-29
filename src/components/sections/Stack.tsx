import Section from "@/components/ui/Section";
import { stackGroups } from "@/data/content";

export default function Stack() {
  return (
    <Section id="stack" index={4} title="stack">
      <dl className="divide-y divide-border">
        {stackGroups.map((group) => (
          <div key={group.label} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
            <dt className="pt-0.5 font-mono text-meta text-muted">{group.label}</dt>
            <dd className="text-body text-ink-2">{group.items.join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
