"use client";

export type FooterProps = {
  bgEnabled?: boolean;
  bgError?: boolean;
  onBgToggle?: () => void;
};

export default function Footer({ bgEnabled = true, bgError = false, onBgToggle }: FooterProps) {
  return (
    <footer className="hidden shrink-0 items-center justify-between gap-3 px-4 py-3 text-[10px] text-text-dim md:flex">
      <p className="m-0">status: ready</p>
      <p className="m-0 hidden sm:block">python / unity / babylon.js</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBgToggle}
          aria-pressed={bgEnabled}
          title="toggle the live runner background"
          className="micro-label rounded border border-white/10 px-2 py-1 text-text-dim hover:text-text"
        >
          {bgError ? "bg: error" : bgEnabled ? "bg: live" : "bg: off"}
        </button>
        <p className="m-0">static node 01</p>
      </div>
    </footer>
  );
}
