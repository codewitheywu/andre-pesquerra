import Image from "next/image";
import portrait from "@/assets/pesquerra-portrait.jpg";
import LinkList from "@/components/ui/LinkList";
import { siteContent } from "@/data/content";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="pt-10 lg:pt-24">
      <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-136">
          <h1
            id="hero-heading"
            className="text-h2 font-semibold text-ink sm:text-h1"
          >
            {siteContent.shortName}
          </h1>
          <p className="mt-2 font-mono text-meta lowercase text-muted">
            {siteContent.role} · {siteContent.location}
          </p>

          <p className="mt-6 text-lead text-ink">
            I build database-driven web apps and persistent browser games. My
            capstone, an appointment system for a dental clinic, pairs a
            Three.js 3D dental chart with an Android companion app.
          </p>
          <p className="mt-4 text-body text-ink-2">
            I also teach Figma and Webflow part-time, and I use AI-assisted
            tools to move faster without skipping the fundamentals.
          </p>

          <LinkList
            className="mt-4"
            links={[
              { label: "résumé", href: siteContent.resume },
              { label: "github", href: siteContent.github },
              { label: "linkedin", href: siteContent.linkedin },
            ]}
          />
        </div>

        <Image
          src={portrait}
          alt={`${siteContent.shortName} in a black suit, white shirt and red tie, wearing thin-framed glasses`}
          placeholder="blur"
          loading="eager"
          sizes="(min-width: 640px) 144px, 96px"
          className="h-auto w-24 shrink-0 rounded-lg border border-border sm:w-36"
        />
      </div>
    </section>
  );
}
