import { siteContent } from "@/data/content";
import PaletteTrigger from "./PaletteTrigger";

/** Sticky top bar below the sidebar breakpoint; the palette is its menu. */
export default function MobileBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg/85 px-4 backdrop-blur lg:hidden">
      <a href="#top" className="inline-flex min-h-11 items-center rounded-sm text-body font-medium text-ink">
        {siteContent.shortName}
      </a>
      <PaletteTrigger
        showShortcut={false}
        className="min-h-11 rounded-md border border-border bg-surface px-4 text-meta text-ink-2"
      >
        Menu
      </PaletteTrigger>
    </header>
  );
}
