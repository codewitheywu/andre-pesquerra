import { siteContent } from "@/data/content";
import LinkList from "@/components/ui/LinkList";
import PaletteTrigger from "./PaletteTrigger";
import SectionNav from "./SectionNav";

/** Fixed identity + navigation column on large screens. */
export default function Sidebar() {
  return (
    <aside
      aria-label="Site"
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-bg px-7 py-8 lg:flex"
    >
      <a href="#top" className="block rounded-sm">
        <span className="block text-lead font-medium text-ink">{siteContent.shortName}</span>
        <span className="block text-meta text-muted">{siteContent.role}</span>
      </a>

      <p className="mt-4 flex items-center gap-2 text-meta text-ink-2">
        <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
        {siteContent.availability}
      </p>

      <div className="mt-10">
        <SectionNav />
      </div>

      <div className="mt-auto space-y-6">
        <PaletteTrigger className="min-h-11 text-meta text-muted hover:text-ink">
          Jump anywhere
        </PaletteTrigger>

        <div className="space-y-1 border-t border-border pt-6 text-meta">
          <p className="text-muted">Reach me at</p>
          <a
            href={`mailto:${siteContent.email}`}
            className="link-draw block break-all font-mono text-ink-2 hover:text-ink"
          >
            {siteContent.email}
          </a>
          <LinkList
            className="pt-2"
            links={[
              { label: "github", href: siteContent.github },
              { label: "linkedin", href: siteContent.linkedin },
            ]}
          />
        </div>
      </div>
    </aside>
  );
}
