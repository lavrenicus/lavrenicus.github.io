/**
 * Section themes for the runner background — a mirror of the preview's
 * own T table (public/runner3d-preview.html, the sanctioned visual spec).
 * Pure data, no three.js: RunnerBackground imports it statically to
 * VALIDATE section keys before posting them to the embedded frame; the
 * frame validates again on its side (unknown key = explicit error).
 * KEEP IN SYNC with the preview table: same keys, colors, fog window 19/32.
 */
export interface RunnerThemeDef {
  key: string;
  name: string;
  bg: number;
  fog: number;
  fogN: number;
  fogF: number;
  floor: number;
  ceil: number;
  back: number;
  accent: number;
}

export const RUNNER_THEMES: Record<string, RunnerThemeDef> = {
  home: {
    key: "home",
    name: "home · neon city",
    bg: 0x05070d,
    fog: 0x0b1526,
    fogN: 19,
    fogF: 32,
    floor: 0x0c1830,
    ceil: 0x121c2c,
    back: 0x080e1c,
    accent: 0x38bdf8,
  },
  experience: {
    key: "experience",
    name: "experience · factory",
    bg: 0x0b0805,
    fog: 0x1d1409,
    fogN: 19,
    fogF: 32,
    floor: 0x261a10,
    ceil: 0x3a2c1a,
    back: 0x1e140c,
    accent: 0xf59e0b,
  },
  games: {
    key: "games",
    name: "games · arcade",
    bg: 0x060810,
    fog: 0x14202a,
    fogN: 19,
    fogF: 32,
    floor: 0x0e2620,
    ceil: 0x1c3a30,
    back: 0x0c201c,
    accent: 0x34d399,
  },
  assets: {
    key: "assets",
    name: "assets · gallery",
    bg: 0x0a0710,
    fog: 0x1c1430,
    fogN: 19,
    fogF: 32,
    floor: 0x221a38,
    ceil: 0x342848,
    back: 0x1e1838,
    accent: 0xa78bfa,
  },
  tech: {
    key: "tech",
    name: "tech · code space",
    bg: 0x020a06,
    fog: 0x0c2214,
    fogN: 19,
    fogF: 32,
    floor: 0x0c2218,
    ceil: 0x163322,
    back: 0x0a1e14,
    accent: 0x4ade80,
  },
  about: {
    key: "about",
    name: "about · blueprint",
    bg: 0x040a12,
    fog: 0x12283c,
    fogN: 19,
    fogF: 32,
    floor: 0x12243a,
    ceil: 0x1e3650,
    back: 0x0e2038,
    accent: 0x60a5fa,
  },
  links: {
    key: "links",
    name: "links · constellation",
    bg: 0x05070d,
    fog: 0x0b1526,
    fogN: 19,
    fogF: 32,
    floor: 0x0c1830,
    ceil: 0x121c2c,
    back: 0x080e1c,
    accent: 0xffffff,
  },
};

export const DEFAULT_THEME_KEY = "home";
