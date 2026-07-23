"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/types";

export function calculateTilt(rect: DOMRect, x: number, y: number) {
  return {
    x: ((rect.top + rect.height / 2 - y) / rect.height) * 5,
    y: ((x - rect.left - rect.width / 2) / rect.width) * 5,
  };
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const card = useRef<HTMLElement>(null);
  const frame = useRef(0);

  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;
    const element = card.current;
    if (!element) return;
    const tilt = calculateTilt(element.getBoundingClientRect(), event.clientX, event.clientY);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty("--tilt-x", `${tilt.x}deg`);
      element.style.setProperty("--tilt-y", `${tilt.y}deg`);
    });
  };
  const reset = () => {
    cancelAnimationFrame(frame.current);
    card.current?.style.setProperty("--tilt-x", "0deg");
    card.current?.style.setProperty("--tilt-y", "0deg");
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <article
      ref={card}
      onPointerMove={move}
      onPointerLeave={reset}
      className="glass-card project-tilt overflow-hidden rounded-xl"
    >
      <div
        className="relative aspect-[5/3] border-b border-white/10"
        style={{
          background: "linear-gradient(135deg, " + project.gradientFrom + ", " + project.gradientTo + ")",
        }}
      >
        <span className="micro-label absolute left-3 top-3 text-text-dim">
          record / {String(index).padStart(2, "0")}
        </span>
        <span className="absolute bottom-3 right-3 h-2 w-2 rounded-full border border-accent" />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold leading-tight tracking-tight">{project.title}</h3>
        <p className="mb-3 font-mono text-[9px] font-light uppercase leading-relaxed tracking-wider text-accent">{project.meta}</p>
        <p className="text-[13px] leading-relaxed text-text-dim">{project.description}</p>
      </div>
    </article>
  );
}
