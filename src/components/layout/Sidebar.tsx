import { siteContent } from "@/data/content";
import LinkList from "@/components/ui/LinkList";
import BrewTrigger from "@/components/brew/BrewTrigger";
import PaletteTrigger from "./PaletteTrigger";
import SectionLink from "./SectionLink";
import SectionNav from "./SectionNav";
import SoundToggle from "./SoundToggle";
import ThemeToggle from "./ThemeToggle";

/**
 * Fixed identity + navigation column on large screens. On short viewports it
 * tightens its spacing, then drops the contact block (still in the Contact
 * section and the palette), so it never needs a scrollbar.
 */
export default function Sidebar() {
  return (
    <aside
      aria-label="Site"
      className="no-scrollbar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-border bg-bg px-7 py-8 short:py-6 shorter:py-5 lg:flex"
    >
      <SectionLink id="top" className="block rounded-sm text-lead font-medium text-ink">
        {siteContent.shortName}
      </SectionLink>

      <div className="mt-10 short:mt-6 shorter:mt-4">
        <SectionNav />
      </div>

      <div className="mt-auto space-y-6 pt-10 short:space-y-4 short:pt-6 shorter:space-y-2 shorter:pt-4">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SoundToggle />
        </div>

        <div className="space-y-1 shorter:space-y-0">
          <PaletteTrigger className="min-h-11 text-meta text-muted hover:text-ink shorter:min-h-9">
            Jump anywhere
          </PaletteTrigger>
          <BrewTrigger className="min-h-11 text-meta text-muted hover:text-ink shorter:min-h-9">
            Brew a cup
          </BrewTrigger>
        </div>

        <div className="space-y-1 border-t border-border pt-6 text-meta short:pt-4 shorter:hidden">
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
