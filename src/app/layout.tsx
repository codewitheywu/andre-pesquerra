import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { siteContent } from "@/data/content";
import { env } from "@/lib/env";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";

// Poppins for UI and headings (chosen over CLAUDE.md's Geist Sans); three
// static weights keep the font budget small.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Mono is only for small metadata; don't let it compete for bandwidth.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const title = `${siteContent.name} — ${siteContent.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: title,
    template: `%s — ${siteContent.shortName}`,
  },
  description: siteContent.description,
  authors: [{ name: siteContent.name, url: env.NEXT_PUBLIC_SITE_URL }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteContent.name,
    title,
    description: siteContent.description,
    locale: "en_US",
    images: [
      {
        url: siteContent.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteContent.name} portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteContent.description,
    images: [siteContent.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#17110d" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable}`}
    >
      <body>
        <noscript>
          <style>{`[data-reveal] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <a
          className="skip-link rounded-md bg-ink px-4 py-2 text-meta text-bg"
          href="#main"
        >
          Skip to content
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
