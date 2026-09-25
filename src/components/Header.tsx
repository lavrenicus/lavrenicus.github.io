"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/projects";
import { normalizePath } from "@/lib/paths";

export default function Header() {
  const path = normalizePath(usePathname());
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <header className="relative z-20 shrink-0 border-b border-white/10 bg-bg/60 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 sm:px-7">
        <Link
          href="/"
          onClick={close}
          className="font-mono text-[11px] font-light tracking-[0.12em] text-text sm:tracking-[0.2em]"
          aria-label="Go to home"
        >
          LAVRENICUS<span className="text-accent">_</span>
        </Link>

        <nav className="hidden items-stretch gap-1 font-mono text-[11px] font-light tracking-wider md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={path === link.href ? "page" : undefined}
              className={
                "relative px-3 py-2 lowercase transition-colors after:absolute after:inset-x-3 after:-bottom-[9px] after:h-px after:bg-transparent" +
                (path === link.href
                  ? " text-accent after:bg-accent"
                  : " text-text-dim hover:text-text")
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <span className={"block h-px w-5 bg-text transition-transform" + (mobileOpen ? " translate-y-[7px] rotate-45" : "")} />
          <span className={"block h-px w-5 bg-text transition-opacity" + (mobileOpen ? " opacity-0" : "")} />
          <span className={"block h-px w-5 bg-text transition-transform" + (mobileOpen ? " -translate-y-[7px] -rotate-45" : "")} />
        </button>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-20 bg-black/45 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="glass-shell absolute inset-x-3 top-[calc(100%+8px)] z-30 rounded-xl bg-[#080b12]/95 p-2 font-mono text-xs shadow-2xl md:hidden"
            aria-label="Mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                aria-current={path === link.href ? "page" : undefined}
                className={
                  "block w-full rounded-lg border border-transparent px-3 py-2.5 text-left lowercase tracking-wider " +
                  (path === link.href ? "border-white/10 text-accent" : "text-text-dim hover:text-text")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
