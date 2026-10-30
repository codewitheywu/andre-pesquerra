import Halftone from "@/components/ui/Halftone";
import type { Service } from "@/data/consulting";

/**
 * A service as a menu entry: name and rate, what it is, then what it covers.
 * On hover the coffee-ring halftone steeps into the corner and the border
 * darkens (opacity and colour only, so reduced motion needs no override).
 */
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <li className="group relative isolate flex flex-col overflow-hidden rounded-lg border border-border bg-surface p-5 transition-colors duration-300 hover:border-muted sm:p-6">
      <Halftone className="absolute -top-12 -right-12 -z-10 size-96 opacity-0 transition-opacity duration-500 [color:color-mix(in_srgb,var(--ink)_var(--card-dots),transparent)] group-hover:opacity-100" />
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
