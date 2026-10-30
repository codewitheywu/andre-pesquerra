import type { Service } from "@/data/consulting";

/** A service as a menu entry: name and rate, what it is, then what it covers. */
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <li className="flex flex-col rounded-lg border border-border bg-surface p-5 sm:p-6">
      <h3 className="text-lead font-semibold tracking-normal text-ink">{service.title}</h3>
      <p className="mt-0.5 font-mono text-meta text-muted">{service.rate}</p>
      <p className="mt-3 mb-5 text-body text-ink-2">{service.summary}</p>
      {/* mt-auto lines the lists up across a row of cards. */}
      <ul className="mt-auto space-y-1.5 border-t border-border pt-4 font-mono text-meta text-ink-2">
        {service.includes.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden="true" className="text-muted">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </li>
  );
}
