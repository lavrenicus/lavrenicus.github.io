"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/projects";
import { normalizePath } from "@/lib/paths";

export default function Breadcrumbs() {
  const path = normalizePath(usePathname());
  const current = navLinks.find((link) => link.href === path);

  return (
    <div className="relative z-10 hidden shrink-0 px-4 py-2 sm:px-7 md:block">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-light tracking-[0.16em] text-text-dim">
        <span aria-hidden="true">~</span>
        <Link href="/" className="transition-colors hover:text-text">
          portfolio
        </Link>
        {path !== "/" && (
          <>
            <span>/</span>
            <span className="text-accent" aria-current="page">{current?.label}</span>
          </>
        )}
      </div>
    </div>
  );
}
