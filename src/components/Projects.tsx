import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="section-frame">
      <header className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="micro-label mb-3 text-accent">01 / selected output</p>
          <h2 className="section-title">Featured projects</h2>
        </div>
        <p className="micro-label hidden text-text-dim sm:block">04 records</p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index + 1} />
          ))}
      </div>
    </section>
  );
}
