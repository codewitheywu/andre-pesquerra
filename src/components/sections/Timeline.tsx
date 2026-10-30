type TimelineEntry = {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  detail: string;
};

/**
 * Menu-style rows: role, dot leader, dates; the organisation underneath.
 * Phones put the dates above the role, where a leader would be a stub.
 */
export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="space-y-7">
      {entries.map((entry) => (
        <li key={entry.id}>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <h3 className="text-body font-medium tracking-normal text-ink">{entry.title}</h3>
            <span aria-hidden="true" className="leader hidden flex-1 self-center sm:block" />
            <span className="order-first shrink-0 font-mono text-meta lowercase text-muted sm:order-none">
              {entry.period}
            </span>
          </div>
          {entry.subtitle && <p className="text-body text-ink-2">{entry.subtitle}</p>}
          {entry.detail && <p className="mt-2 max-w-136 text-meta text-muted">{entry.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
