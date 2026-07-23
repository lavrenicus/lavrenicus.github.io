import { techSkills } from "@/data/projects";

export default function TechGrid() {
  return (
    <section id="tech" className="section-frame">
      <header className="mb-7">
        <p className="micro-label mb-3 text-accent">04 / capabilities</p>
        <h2 className="section-title">Technical background</h2>
      </header>
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-5">
          {techSkills.map((skill, index) => (
            <li
              key={skill.name}
              className="glass-card edge-hover flex min-h-20 flex-col justify-between rounded-xl p-3.5 font-mono text-[11px] font-light text-text-dim"
            >
              <span className="text-[9px] text-text-dim/60">{String(index + 1).padStart(2, "0")}</span>
              <span>{skill.name}</span>
            </li>
          ))}
      </ul>
    </section>
  );
}
