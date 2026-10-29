import type { ReactNode } from "react";
import CommandPalette from "@/components/layout/CommandPalette";
import MobileBar from "@/components/layout/MobileBar";
import Sidebar from "@/components/layout/Sidebar";
import SiteFooter from "@/components/layout/SiteFooter";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <MobileBar />
      <div className="lg:pl-64">
        <main id="main" tabIndex={-1} className="mx-auto max-w-170 px-5 sm:px-8">
          {children}
          <SiteFooter />
        </main>
      </div>
      <CommandPalette />
    </>
  );
}
