import { projects } from "@/data/projects";
import type { ProjectItem } from "@/types";
import ProjectCard from "./ProjectCard";

function ProjectGroup({ title, items }: { title: string; items: ProjectItem[] }) {
  return (
    <section aria-labelledby={`${title}-projects`}>
      <h3 id={`${title}-projects`} className="micro-label mb-3 text-text-dim">{title} projects</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((project, index) => <ProjectCard key={project.id} project={project} index={index + 1} />)}
      </div>
    </section>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section-frame">
      <header className="mb-6">
        <p className="micro-label mb-3 text-accent">01 / pipeline &amp; tools</p>
        <h2 className="section-title">Projects</h2>
      </header>
      <div className="space-y-8">
        <ProjectGroup title="personal" items={projects.filter(({ scope }) => scope === "personal")} />
        <ProjectGroup title="team" items={projects.filter(({ scope }) => scope === "team")} />
      </div>
    </section>
  );
}
