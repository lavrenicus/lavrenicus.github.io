"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ProjectItem } from "@/types";

export function calculateTilt(rect: DOMRect, x: number, y: number) {
  return {
    x: ((rect.top + rect.height / 2 - y) / rect.height) * 5,
    y: ((x - rect.left - rect.width / 2) / rect.width) * 5,
  };
}

export default function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const card = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const links = [...(project.link ? [{ href: project.link, label: project.linkLabel ?? "view" }] : []), ...(project.links ?? [])];

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
      className="glass-card project-tilt rounded-xl p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="micro-label text-text-dim">record / {String(index).padStart(2, "0")}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="micro-label text-text-dim">{project.scope}</span>
          {project.status && <span className="micro-label text-accent">{project.status}</span>}
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold leading-tight tracking-tight">{project.title}</h3>
      {(project.period ?? project.year) && <p className="micro-label mb-2 text-text-dim">{project.period ?? project.year}</p>}
      {project.images && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {project.images.map((image) => (
            <Image key={image.src} src={image.src} alt={image.alt} width={620} height={349} className="h-auto rounded border border-white/10" />
          ))}
        </div>
      )}
      <p className="mb-3 break-words font-mono text-[9px] font-light uppercase leading-relaxed tracking-wider text-accent">{project.meta}</p>
      <p className="mb-4 text-[13px] leading-relaxed text-text-dim">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.stack.map((item) => (
          <span key={item} className="micro-label rounded border border-white/10 px-2 py-1 text-text-dim">
            {item}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3">
        {links.map(({ href, label }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="mt-4 font-mono text-[11px] text-accent hover:underline">
            {label} →
          </a>
        ))}
      </div>
    </article>
  );
}
