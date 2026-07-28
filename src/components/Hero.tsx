export default function Hero({ onNavigate }: { onNavigate?: (key: string) => void }) {
  const terminalCode = "> import pipeline\n> render.optimize()\n> deploy(target=\"web\")\n> status: ready_";

  return (
    <section id="home" className="section-frame flex items-center">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)] lg:items-end">
        <div>
          <p className="micro-label mb-5 text-accent">
            signal / technical artist / developer
          </p>
          <h1 className="mb-6 max-w-[820px] text-[clamp(2.6rem,7vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.065em]">
            Tools. Pipelines.
            <br />
            Playable worlds.
          </h1>
          <p className="mb-7 max-w-[610px] text-[clamp(.95rem,1.5vw,1.12rem)] leading-relaxed text-text-dim">
            Technical art, real-time engine integration and CG pipeline automation.
            Based in Thailand, working across Python, Unity and Babylon.js.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onNavigate?.("experience")} className="edge-hover rounded-lg border border-accent bg-accent px-5 py-3 font-mono text-[11px] tracking-wider text-bg">
            view my work
            </button>
            <button onClick={() => onNavigate?.("games")} className="edge-hover rounded-lg border border-white/15 bg-white/[.025] px-5 py-3 font-mono text-[11px] tracking-wider text-text">
            play demos
            </button>
          </div>
        </div>
        <aside className="glass-card rounded-xl p-1">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="micro-label text-text-dim">tty / build</span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <pre className="m-0 overflow-x-auto p-4 font-mono text-[11px] font-light leading-7 text-text-dim">
            <code>{terminalCode}</code>
          </pre>
        </aside>
      </div>
    </section>
  );
}
