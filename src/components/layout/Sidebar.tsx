import { siteContent } from "@/data/content";
import LinkList from "@/components/ui/LinkList";
import PaletteTrigger from "./PaletteTrigger";
import SectionLink from "./SectionLink";
import SectionNav from "./SectionNav";
import SoundToggle from "./SoundToggle";
import ThemeToggle from "./ThemeToggle";

/** Fixed identity + navigation column on large screens. */
export default function Sidebar() {
  return (
    <aside
      aria-label="Site"
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-border bg-bg px-7 py-8 lg:flex"
    >
      <SectionLink id="top" className="block rounded-sm text-lead font-medium text-ink">
        {siteContent.shortName}
      </SectionLink>

      <div className="mt-10">
        <SectionNav />
      </div>

      <div className="mt-auto space-y-6 pt-10">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SoundToggle />
        </div>

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
