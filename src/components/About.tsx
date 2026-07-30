export default function About() {
  return (
    <section id="about" className="section-frame">
      <p className="micro-label mb-3 text-accent">05 / profile</p>
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <h2 className="section-title">About the operator</h2>
        <div className="glass-card rounded-2xl p-5 sm:p-7">
          <p className="mb-6 text-[clamp(1.05rem,2vw,1.4rem)] leading-relaxed text-text">
            Technical artist and Python developer working on CG pipeline automation,
            real-time engine integration and rigging tools.
          </p>
          <p className="mb-7 text-sm leading-relaxed text-text-dim">
            Background in VFX and animation studio pipelines, motion capture, and
            render farm management.
          </p>
          <dl className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 font-mono text-[10px] min-[420px]:grid-cols-2">
            <div className="bg-[#0b0b0f] p-3">
              <dt className="mb-1 text-text-dim">base</dt>
              <dd className="m-0 text-text">Hua Hin, Thailand</dd>
            </div>
            <div className="bg-[#0b0b0f] p-3">
              <dt className="mb-1 text-text-dim">focus</dt>
              <dd className="m-0 text-text">tools + realtime</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
