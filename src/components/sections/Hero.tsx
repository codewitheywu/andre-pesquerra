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
          <p className="mt-6 text-lead text-ink">
            I&apos;m a full-stack web developer who builds database-driven
            applications end to end. I focus on functional, scalable software,
            with clear data models and server logic that hold up as usage
            grows.
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
