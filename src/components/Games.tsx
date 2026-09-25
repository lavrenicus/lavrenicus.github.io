"use client";
import { useEffect, useRef, useState } from "react";
import { games } from "@/data/projects";
import { useTheater } from "./theater-context";

const DEMOS = games;

export default function Games() {
  const [active, setActive] = useState(DEMOS[0].demoKey);
  const [inFullscreen, setInFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const { theater, setTheater } = useTheater();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const selected = DEMOS.find((demo) => demo.demoKey === active) ?? DEMOS[0];
  const fullscreenSupported =
    typeof document !== "undefined" && document.fullscreenEnabled === true;
  const theaterOn = Boolean(theater);

  useEffect(() => {
    const onChange = () => setInFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!theaterOn) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTheater(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [theaterOn, setTheater]);

  const toggleFullscreen = async () => {
    if (!fullscreenSupported) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        const frame = frameRef.current;
        if (!frame) throw new Error("demo iframe element is missing");
        await frame.requestFullscreen();
      }
      setFullscreenError(false);
    } catch (error) {
      console.error("fullscreen request failed:", error);
      setFullscreenError(true);
    }
  };

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

        <div
          id="demo-player"
          role="tabpanel"
          className="relative min-h-52 overflow-hidden rounded-xl border border-white/10 bg-black/40"
        >
          <div className="absolute right-2 top-2 z-10 flex gap-1.5">
            <button
              type="button"
              aria-pressed={theaterOn}
              title={
                theaterOn
                  ? "exit theater mode (esc)"
                  : "theater mode: dim everything but the demo (esc exits)"
              }
              onClick={() => setTheater(!theaterOn)}
              className="edge-hover rounded border border-white/15 bg-black/60 px-2 py-1 micro-label text-text-dim hover:text-text"
            >
              {theaterOn ? "exit theater" : "theater"}
            </button>
            <button
              type="button"
              disabled={!fullscreenSupported}
              aria-label={inFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={
                fullscreenSupported
                  ? "fullscreen (esc exits)"
                  : "fullscreen unavailable on this platform"
              }
              onClick={toggleFullscreen}
              className="edge-hover rounded border border-white/15 bg-black/60 px-2 py-1 micro-label text-text-dim hover:text-text disabled:cursor-not-allowed disabled:opacity-45"
            >
              {inFullscreen ? "exit fullscreen" : "fullscreen"}
            </button>
          </div>
          {fullscreenError && (
            <span className="micro-label absolute left-2 top-2 z-10 text-red-400" role="status">
              fullscreen error
            </span>
          )}
          {selected.demoAvailable ? (
            <iframe
              key={active}
              ref={frameRef}
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
