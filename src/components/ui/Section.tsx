import type { ReactNode } from "react";
import TextLink from "./TextLink";
import Reveal from "./Reveal";

type SectionProps = {
  id: string;
  index: number;
  title: string;
  action?: { label: string; href: string };
  children: ReactNode;
};

/** A numbered, quiet section: `01 — projects` with an optional link on the right. */
export default function Section({ id, index, title, action, children }: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-8">
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <h2
            id={headingId}
            tabIndex={-1}
            className="font-mono text-meta font-normal tracking-normal text-muted"
          >
            {String(index).padStart(2, "0")} — {title}
          </h2>
          {action && (
            <TextLink
              href={action.href}
              className="inline-flex min-h-11 items-center font-mono text-meta lowercase lg:min-h-0"
            >
              {action.label}
            </TextLink>
          )}
        </div>
        {children}
      </Reveal>
    </section>
  );
}
