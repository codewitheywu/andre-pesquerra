import CopyButton from "@/components/ui/CopyButton";
import Section from "@/components/ui/Section";
import LinkList from "@/components/ui/LinkList";
import { siteContent } from "@/data/content";

export default function Contact() {
  return (
    <Section id="contact" title="Contact">
      <p className="max-w-136 text-lead text-ink">
        Email is the best way to reach me, whether it&apos;s about a role, a
        freelance build, or a Figma or Webflow class.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${siteContent.email}`}
          className="press inline-flex min-h-11 items-center rounded-md bg-ink px-4 font-mono text-meta text-bg transition-opacity hover:opacity-90"
        >
          {siteContent.email}
        </a>
        <CopyButton value={siteContent.email} label="Copy email address" />
      </div>

      <LinkList
        className="mt-4"
        links={[
          { label: "github", href: siteContent.github },
          { label: "linkedin", href: siteContent.linkedin },
          { label: "résumé", href: siteContent.resume },
        ]}
      />
    </Section>
  );
}
