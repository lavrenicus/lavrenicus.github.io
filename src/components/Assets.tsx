import { assets } from "@/data/projects";

export default function Assets() {
  return (
    <section id="assets" className="section-frame">
      <header className="mb-6">
        <p className="micro-label mb-3 text-accent">03 / 3d assets</p>
        <h2 className="section-title">Assets</h2>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset, index) => (
          <a
            key={asset.id}
            href={asset.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card edge-hover group overflow-hidden rounded-xl"
          >
            <div
              className="relative aspect-square border-b border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url(${asset.image})` }}
            >
              <span className="micro-label absolute left-3 top-3 text-text-dim">
                model / {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="p-4">
              <h3 className="mb-1 text-base font-semibold leading-tight tracking-tight group-hover:text-accent">
                {asset.title}
              </h3>
              <p className="font-mono text-[9px] font-light uppercase leading-relaxed tracking-wider text-accent">
                {asset.meta}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
