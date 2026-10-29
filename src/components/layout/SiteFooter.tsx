import { siteContent } from "@/data/content";
import PaletteTrigger from "./PaletteTrigger";

export default function SiteFooter() {
  return (
    <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-border py-8 font-mono text-meta text-muted">
      <p>
        © {new Date().getFullYear()} {siteContent.name}
      </p>
      <PaletteTrigger className="min-h-11 hover:text-ink">Jump anywhere</PaletteTrigger>
    </footer>
  );
}
