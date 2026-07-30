"use client";
import { ComponentType, useCallback, useRef, useState } from "react";
import GridOverlay from "./GridOverlay";
import Header from "./Header";
import Breadcrumbs from "./Breadcrumbs";
import Hero from "./Hero";
import Experience from "./Experience";
import Games from "./Games";
import Assets from "./Assets";
import TechGrid from "./TechGrid";
import About from "./About";
import Links from "./Links";
import Footer from "./Footer";

export type SectionProps = { onNavigate?: (key: string) => void };

const SECTIONS: Record<string, ComponentType<SectionProps>> = {
  home: Hero,
  experience: Experience,
  games: Games,
  assets: Assets,
  tech: TechGrid,
  about: About,
  links: Links,
};

export default function PortfolioApp() {
  const [active, setActive] = useState("home");
  const [pulseSignal, setPulseSignal] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const ActiveSection = SECTIONS[active] ?? Hero;
  const navigate = useCallback((key: string) => {
    setActive((current) => {
      if (current !== key) setPulseSignal((n) => n + 1);
      return key;
    });
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg pb-[env(safe-area-inset-bottom)]">
      <GridOverlay dimmed={active === "games"} pulseSignal={pulseSignal} />
      <Header active={active} onNavigate={navigate} />
      <Breadcrumbs active={active} onNavigate={navigate} />
      <main
        ref={mainRef}
        data-testid="content-panel"
        className="glass-shell panel-scroll relative z-10 mx-2 min-h-0 flex-1 overflow-y-auto rounded-[18px] sm:mx-5 sm:rounded-[22px] lg:ml-[4vw] lg:mr-[26vw] lg:max-w-[1120px]"
      >
        <div key={active} className="section-enter">
          <ActiveSection onNavigate={navigate} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
