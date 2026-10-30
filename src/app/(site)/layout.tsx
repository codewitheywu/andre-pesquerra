import type { ReactNode } from "react";
import CommandPalette from "@/components/layout/CommandPalette";
import PreferenceEffects from "@/components/layout/PreferenceEffects";
import MobileBar from "@/components/layout/MobileBar";
import Sidebar from "@/components/layout/Sidebar";
import SiteFooter from "@/components/layout/SiteFooter";
import Halftone from "@/components/ui/Halftone";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* The coffee-ring stain, top right, and a second print where the page ends. */}
      <Halftone className="absolute top-0 right-0 -z-10 size-105 max-w-full sm:size-160" />
      <Sidebar />
      <MobileBar />
      <div className="relative lg:pl-64">
        <Halftone className="absolute bottom-0 left-0 -z-10 size-80 rotate-180 lg:left-64" />
        <main id="main" tabIndex={-1} className="mx-auto max-w-170 px-5 sm:px-8">
          {children}
          <SiteFooter />
        </main>
      </div>
      <CommandPalette />
      <PreferenceEffects />
    </>
  );
}
