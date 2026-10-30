import type { ReactNode } from "react";
import TextLink from "./TextLink";
import Reveal from "./Reveal";

type SectionProps = {
  id: string;
  title: string;
  action?: { label: string; href: string };
  children: ReactNode;
};

/** A section headed like a café menu line: title, dot leader, then its link. */
export default function Section({ id, title, action, children }: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-8">
      <Reveal>
        <div className="mb-6 flex items-center gap-3">
          <h2 id={headingId} tabIndex={-1} className="text-h3 font-semibold text-ink">
            {title}
          </h2>
          <span aria-hidden="true" className="leader flex-1" />
          {action && (
            <TextLink
              href={action.href}
              className="inline-flex min-h-11 items-center font-mono text-meta lowercase lg:min-h-6"
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
