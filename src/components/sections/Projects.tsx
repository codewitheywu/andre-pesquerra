import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { siteContent } from "@/data/content";
import type { Project } from "@/types/content";

function ProjectRow({ project }: { project: Project }) {
  const body = (
    <div className="py-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
        <h3 className="text-lead font-medium tracking-normal text-ink">
          {project.title}
          {project.liveUrl && (
            <span aria-hidden="true" className="nudge nudge-up ml-2 text-muted">
              ↗
            </span>
          )}
        </h3>
        {project.year && (
          <>
            <span aria-hidden="true" className="leader hidden flex-1 self-center sm:block" />
            <span className="order-first shrink-0 font-mono text-meta text-muted sm:order-0">
              {project.year}
            </span>
          </>
        )}
      </div>
      {project.summary && <p className="mt-1 text-body text-ink-2">{project.summary}</p>}
      <p className="mt-2 font-mono text-meta text-muted">
        {[project.role, ...project.stack].filter(Boolean).join(" · ")}
      </p>
    </div>
  );

  if (!project.liveUrl) {
    return <li>{body}</li>;
  }

  return (
    <li>
      <a
        href={project.liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="-mx-3 block rounded-md px-3 transition-colors hover:bg-surface-2"
      >
        {body}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  return (
    <Section
      id="projects"
      title="Projects"
      action={{ label: "github", href: siteContent.github }}
    >
      {projects.length > 0 ? (
        <ul className="-my-5">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </ul>
      ) : (
        <p className="text-body text-ink-2">
          Project write-ups are being added. In the meantime, the code is on{" "}
          <span className="whitespace-nowrap"><TextLink href={siteContent.github}>GitHub</TextLink>.</span>
        </p>
      )}
    </Section>
  );
}
