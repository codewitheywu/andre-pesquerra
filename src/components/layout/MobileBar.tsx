import { siteContent } from "@/data/content";
import PaletteTrigger from "./PaletteTrigger";
import SectionLink from "./SectionLink";
import SoundToggle from "./SoundToggle";
import ThemeToggle from "./ThemeToggle";

/** Sticky top bar below the sidebar breakpoint; the palette is its menu. */
export default function MobileBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-2 border-b border-border bg-bg/85 px-4 backdrop-blur lg:hidden">
      <SectionLink
        id="top"
        className="inline-flex min-h-11 min-w-0 items-center truncate rounded-sm text-body font-medium text-ink"
      >
        {siteContent.shortName}
      </SectionLink>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <SoundToggle />
        <PaletteTrigger
          showShortcut={false}
          className="min-h-11 rounded-md border border-border bg-surface px-3 text-meta text-ink-2"
        >
          Menu
        </PaletteTrigger>
      </div>
    </header>
  );
}
