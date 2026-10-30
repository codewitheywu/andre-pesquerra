import type { ReactNode } from "react";
import CommandPalette from "@/components/layout/CommandPalette";
import PreferenceEffects from "@/components/layout/PreferenceEffects";
import MobileBar from "@/components/layout/MobileBar";
import Sidebar from "@/components/layout/Sidebar";
import SiteFooter from "@/components/layout/SiteFooter";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute top-0 right-0 -z-10 h-130 w-130 max-w-full"
      />
      <Sidebar />
      <MobileBar />
      <div className="lg:pl-64">
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
