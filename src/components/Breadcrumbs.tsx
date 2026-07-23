"use client";
import { navLinks } from "@/data/projects";

export default function Breadcrumbs({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (key: string) => void;
}) {
  const current = navLinks.find((l) => l.href === active);

  return (
    <div className="relative z-10 shrink-0 px-4 py-2 sm:px-7">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-light tracking-[0.16em] text-text-dim">
        <span aria-hidden="true">~</span>
        <button onClick={() => onNavigate("home")} className="transition-colors hover:text-text">
          portfolio
        </button>
        {active !== "home" && (
          <>
            <span>/</span>
            <span className="text-accent" aria-current="page">{current?.label}</span>
          </>
        )}
      </div>
    </div>
  );
}
