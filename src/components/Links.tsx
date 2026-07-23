import { socialLinks } from "@/data/projects";

export default function Links() {
  return (
    <section id="links" className="section-frame">
      <header className="mb-7">
        <p className="micro-label mb-3 text-accent">05 / uplinks</p>
        <h2 className="section-title">External links</h2>
      </header>
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
          {socialLinks.map((link, index) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="glass-card edge-hover flex items-center justify-between rounded-xl p-4 font-mono text-xs font-light tracking-wider text-text-dim hover:text-text"
              >
                <span><span className="mr-3 text-[9px] text-text-dim/50">{String(index + 1).padStart(2, "0")}</span>{link.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
      </ul>
    </section>
  );
}
