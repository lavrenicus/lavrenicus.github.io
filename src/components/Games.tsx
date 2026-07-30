"use client";
import { useState } from "react";
import { games } from "@/data/projects";

const DEMOS = games;

export default function Games() {
  const [active, setActive] = useState(DEMOS[0].demoKey);
  const selected = DEMOS.find((demo) => demo.demoKey === active) ?? DEMOS[0];

  return (
    <section id="games" className="section-frame">
      <header className="mb-6">
        <p className="micro-label mb-3 text-accent">02 / interactive builds</p>
        <h2 className="section-title">Playable demos</h2>
      </header>
      <div className="glass-card grid gap-3 rounded-2xl p-3 md:grid-cols-[210px_minmax(0,1fr)]">
        <div className="flex flex-col gap-2" role="tablist" aria-label="Select a demo">
          {DEMOS.map((demo) => (
            <button
              key={demo.id}
              role="tab"
              aria-selected={active === demo.demoKey}
              aria-controls="demo-player"
              className={
                "edge-hover rounded-lg border px-3 py-3 text-left font-mono text-[10px] font-light tracking-wide " +
                (active === demo.demoKey
                  ? "border-accent-dim bg-accent/[.06] text-accent"
                  : "border-white/10 bg-white/[.025] text-text-dim hover:text-text")
              }
              onClick={() => setActive(demo.demoKey)}
            >
              {demo.title}
            </button>
          ))}
        </div>

        <div id="demo-player" role="tabpanel" className="relative min-h-52 overflow-hidden rounded-xl border border-white/10 bg-black/40">
          {selected.demoAvailable ? (
            <iframe
              key={active}
              src={"/demos/" + active + "/index.html"}
              title={selected.title + " playable demo"}
              loading="lazy"
              className="block aspect-video w-full border-0 bg-[#050507]"
            />
          ) : (
            <div className="flex aspect-video min-h-52 flex-col items-center justify-center p-6 text-center">
              <span className="mb-4 h-2 w-2 rounded-full border border-accent" />
              <p className="micro-label mb-2 text-text">build slot / awaiting export</p>
              <p className="max-w-sm font-mono text-[10px] font-light leading-relaxed text-text-dim">
                Add the WebGL build to /public/demos/{active}/ and set demoAvailable.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
