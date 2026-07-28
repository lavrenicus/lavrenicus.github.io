import { projects } from "@/data/projects";
import type { ProjectItem } from "@/types";
import ProjectCard from "./ProjectCard";

export const chronologically = (items: ProjectItem[]) =>
  [...items].sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity));

export default function Experience() {
  return (
    <section id="experience" className="section-frame">
      <header className="mb-6">
        <p className="micro-label mb-3 text-accent">01 / roles &amp; projects</p>
        <h2 className="section-title">Experience</h2>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {chronologically(projects).map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index + 1} />
        ))}
      </div>
    </section>
  );
}
