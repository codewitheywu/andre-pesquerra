import { siteContent } from "@/data/content";
import BrewTrigger from "@/components/brew/BrewTrigger";
import PaletteTrigger from "./PaletteTrigger";

export default function SiteFooter() {
  return (
    <footer className="mt-24 pb-8 font-mono text-meta text-muted">
      <div aria-hidden="true" className="leader" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4">
        <p>
          © {new Date().getFullYear()} {siteContent.name}
        </p>
        {/* Desktop has these in the sidebar; repeat them only where it is hidden. */}
        <div className="flex flex-wrap items-center gap-x-5 lg:hidden">
          <BrewTrigger className="min-h-11 hover:text-ink">Brew a cup</BrewTrigger>
          <PaletteTrigger className="min-h-11 hover:text-ink">Jump anywhere</PaletteTrigger>
        </div>
      </div>
    </footer>
  );
}
