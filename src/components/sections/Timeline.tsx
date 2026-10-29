type TimelineEntry = {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  detail: string;
};

/** Period on the left, role and organisation on the right (CLAUDE.md §1). */
export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={entry.id} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
          <span className="pt-0.5 font-mono text-meta lowercase text-muted">{entry.period}</span>
          <div>
            <h3 className="text-body font-medium tracking-normal text-ink">{entry.title}</h3>
            {entry.subtitle && <p className="text-body text-ink-2">{entry.subtitle}</p>}
            {entry.detail && <p className="mt-2 text-meta text-muted">{entry.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
