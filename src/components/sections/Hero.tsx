import Image from "next/image";
import portrait from "@/assets/pesquerra-portrait.jpg";
import LinkList from "@/components/ui/LinkList";
import { siteContent } from "@/data/content";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="pt-10 lg:pt-24">
      {/* From sm up the photo stretches to the height of the name and intro. */}
      <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">
          <h1 id="hero-heading" className="text-h2 font-semibold text-ink sm:text-h1">
            {siteContent.shortName}
          </h1>
          <p className="mt-2 font-mono text-meta lowercase text-muted">{siteContent.location}</p>

          <p className="mt-6 text-lead text-ink">
            <span className="font-medium">Full-stack developer and project lead.</span>{" "}
            I design and build database-driven web applications, from the data
            model and server logic to the interface people use.
          </p>
          <p className="mt-4 text-body text-ink-2">
            As project lead for my capstone, I delivered an appointment
            management system for Gavina Noble Dental Clinic, with a Three.js
            3D dental chart and an Android companion app. I also teach Figma
            and Webflow part-time.
          </p>
        </div>

        <div className="relative aspect-800/1143 w-24 shrink-0 overflow-hidden rounded-lg border border-border sm:aspect-auto sm:w-44">
          <Image
            src={portrait}
            alt={`${siteContent.shortName} in a black suit, white shirt and red tie, wearing thin-framed glasses`}
            placeholder="blur"
            loading="eager"
            fill
            sizes="(min-width: 640px) 176px, 96px"
            className="object-cover object-top"
          />
        </div>
      </div>

      <LinkList
        className="mt-4"
        links={[
          { label: "résumé", href: siteContent.resume },
          { label: "github", href: siteContent.github },
          { label: "linkedin", href: siteContent.linkedin },
        ]}
      />
    </section>
  );
}
