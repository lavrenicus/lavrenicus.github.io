"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";
import RunnerBackground from "./RunnerBackground";
import { TheaterContext } from "./theater-context";
import { normalizePath, sectionFromPath } from "@/lib/paths";

/**
 * App-shell: fixed chrome (header, breadcrumbs, footer), the scrollable glass
 * panel around the routed page, the runner background and theater mode.
 * Mounted once from src/app/layout.tsx; the current page renders inside.
 */
export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const path = normalizePath(pathname);
  const section = sectionFromPath(pathname);

  const [theater, setTheater] = useState(false);
  const [bgEnabled, setBgEnabled] = useState(true);
  const [bgError, setBgError] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const firstPath = useRef(true);

  // Route change: scroll panel to top + leave theater mode.
  // The first run is the initial mount, not a navigation — no action for it.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    setTheater(false);
    mainRef.current?.scrollTo({ top: 0 });
  }, [path]);

  // Runner background preference: stored toggle wins; otherwise honor
  // prefers-reduced-motion by default (todo §4.2 — static for reduce).
  // Read is scheduled (not synchronous in the effect body) so the static
  // export hydrates with the default first, then settles to the stored value.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("runner-bg");
        if (stored === "off") {
          setBgEnabled(false);
          return;
        }
        if (stored === null && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setBgEnabled(false);
        }
      } catch (error) {
        console.error("runner background preference read failed:", error);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleBg = () => {
    const next = !bgEnabled;
    setBgEnabled(next);
    if (next) setBgError(false);
    try {
      window.localStorage.setItem("runner-bg", next ? "on" : "off");
    } catch (error) {
      console.error("runner background preference write failed:", error);
    }
  };

  return (
    <TheaterContext.Provider value={{ theater, setTheater }}>
      <div className="flex h-dvh flex-col overflow-hidden bg-bg pb-[env(safe-area-inset-bottom)]">
        <RunnerBackground
          themeKey={section}
          enabled={bgEnabled}
          onError={() => setBgError(true)}
        />
        {theater && (
          <div
            data-testid="theater-backdrop"
            onClick={() => setTheater(false)}
            className="fixed inset-0 z-30 bg-black/85"
          />
        )}
        <Header />
        <Breadcrumbs />
        <main
          ref={mainRef}
          data-testid="content-panel"
          className={
            "glass-shell panel-scroll relative mx-2 min-h-0 flex-1 overflow-y-auto rounded-[18px] sm:mx-5 sm:rounded-[22px] lg:ml-[4vw] lg:mr-[26vw] lg:max-w-[1120px] " +
            (theater ? "z-40" : "z-10")
          }
        >
          <div key={path} className="section-enter">
            {children}
          </div>
        </main>
        <Footer bgEnabled={bgEnabled} bgError={bgError} onBgToggle={toggleBg} />
      </div>
    </TheaterContext.Provider>
  );
}
