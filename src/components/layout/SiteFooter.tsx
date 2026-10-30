import { siteContent } from "@/data/content";
import PaletteTrigger from "./PaletteTrigger";

export default function SiteFooter() {
  return (
    <footer className="mt-24 pb-8 font-mono text-meta text-muted">
      <div aria-hidden="true" className="leader" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4">
        <p>
          © {new Date().getFullYear()} {siteContent.name}
        </p>
        <PaletteTrigger className="min-h-11 hover:text-ink">Jump anywhere</PaletteTrigger>
      </div>
      <p>Brewed with Next.js and Supabase. Set in Poppins and Geist Mono.</p>
    </footer>
  );
}
