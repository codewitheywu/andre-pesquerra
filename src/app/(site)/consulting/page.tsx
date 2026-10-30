import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/consulting/InquiryForm";
import ServiceCard from "@/components/consulting/ServiceCard";
import { services } from "@/data/consulting";
import { siteContent } from "@/data/content";

const description =
  "Graphic design, web development, thesis system support and IoT development by Andre Pesquerra. Send an inquiry for a quote.";

export const metadata: Metadata = {
  title: "Consulting",
  description,
  alternates: { canonical: "/consulting" },
  openGraph: {
    type: "website",
    url: "/consulting",
    siteName: siteContent.name,
    title: `Consulting — ${siteContent.name}`,
    description,
    images: [siteContent.ogImage],
  },
};

function PartHeading({ id, title }: { id: string; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h2 id={id} className="text-h3 font-semibold text-ink">
        {title}
      </h2>
      <span aria-hidden="true" className="leader flex-1" />
    </div>
  );
}

export default function ConsultingPage() {
  return (
    <div className="pb-8 pt-10 lg:pt-24">
      <Link
        href="/"
        className="press inline-flex min-h-11 items-center gap-1.5 font-mono text-meta text-muted transition-colors hover:text-ink lg:min-h-6"
      >
        <span aria-hidden="true">←</span>
        back home
      </Link>

      <h1 className="mt-6 text-h2 font-semibold text-ink sm:text-h1">Consulting</h1>
      <p className="mt-4 max-w-136 text-lead text-ink-2">
        Design and development help for businesses, schools and students. Pick what you need, or
        describe it below and we&apos;ll figure out the fit together.
      </p>

      <section aria-labelledby="services-heading" className="mt-16">
        <PartHeading id="services-heading" title="Services" />
        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </ul>
        <p className="mt-5 text-body text-ink-2">
          Something that doesn&apos;t fit a box? Choose &ldquo;Something else&rdquo; in the form.
        </p>
      </section>

      <section aria-labelledby="inquiry-heading" className="mt-16">
        <PartHeading id="inquiry-heading" title="Inquiry" />
        <InquiryForm />
      </section>
    </div>
  );
}
