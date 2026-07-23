"use client";
import { ComponentType, useCallback, useRef, useState } from "react";
import GridOverlay from "./GridOverlay";
import Header from "./Header";
import Breadcrumbs from "./Breadcrumbs";
import Hero from "./Hero";
import Projects from "./Projects";
import Games from "./Games";
import TechGrid from "./TechGrid";
import About from "./About";
import Links from "./Links";
import Footer from "./Footer";

export type SectionProps = { onNavigate?: (key: string) => void };

const SECTIONS: Record<string, ComponentType<SectionProps>> = {
  home: Hero,
  projects: Projects,
  games: Games,
  tech: TechGrid,
  about: About,
  links: Links,
};

export default function PortfolioApp() {
  const [active, setActive] = useState("home");
  const mainRef = useRef<HTMLElement>(null);
  const ActiveSection = SECTIONS[active] ?? Hero;
  const navigate = useCallback((key: string) => {
    setActive(key);
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg">
      <GridOverlay dimmed={active === "games"} />
      <Header active={active} onNavigate={navigate} />
      <Breadcrumbs active={active} onNavigate={navigate} />
      <main
        ref={mainRef}
        data-testid="content-panel"
        className="glass-shell panel-scroll relative z-10 mx-3 min-h-0 flex-1 overflow-y-auto rounded-[22px] sm:mx-5 lg:ml-[4vw] lg:mr-[18vw] lg:max-w-[1120px]"
      >
        <div key={active} className="section-enter">
          <ActiveSection onNavigate={navigate} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
