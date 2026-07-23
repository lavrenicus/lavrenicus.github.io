import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="section-frame">
      <header className="mb-6">
        <p className="micro-label mb-3 text-accent">01 / pipeline &amp; tools</p>
        <h2 className="section-title">Projects</h2>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index + 1} />
        ))}
      </div>
    </section>
  );
}
