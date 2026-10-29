import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { siteContent } from "@/data/content";
import type { Project } from "@/types/content";

function ProjectRow({ project }: { project: Project }) {
  const body = (
    <div className="flex items-start justify-between gap-6 py-5">
      <div className="min-w-0">
        <h3 className="text-lead font-medium tracking-normal text-ink">
          {project.title}
          {project.liveUrl && (
            <span aria-hidden="true" className="nudge nudge-up ml-2 text-muted">
              ↗
            </span>
          )}
        </h3>
        {project.summary && <p className="mt-1 text-body text-ink-2">{project.summary}</p>}
        <p className="mt-2 font-mono text-meta text-muted">
          {[project.role, ...project.stack].filter(Boolean).join(" · ")}
        </p>
      </div>
      {project.year && (
        <span className="shrink-0 pt-1 font-mono text-meta text-muted">{project.year}</span>
      )}
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
      index={1}
      title="projects"
      action={{ label: "github", href: siteContent.github }}
    >
      {projects.length > 0 ? (
        <ul className="divide-y divide-border">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </ul>
      ) : (
        <p className="text-body text-ink-2">
          Project write-ups are being added. In the meantime, the code is on{" "}
          <TextLink href={siteContent.github}>GitHub</TextLink>.
        </p>
      )}
    </Section>
  );
}
