# Lavrenicus Portfolio

Next.js + TypeScript + Tailwind CSS. Static export to GitHub Pages.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build & Deploy

```bash
npm run build
```

The static output is in `out/`. Deployed automatically via GitHub Actions on push to `master`.

## Content structure

All content lives in `src/data/projects.ts`, split into three entities:

- **`projects`** — technical/pipeline work with no playable demo (SmartPool, NNRigger, OpenClaw...). Add an object with `title`, `meta`, `description`, `stack`, optional `link`.
- **`games`** — playable WebGL builds. Add an object with `title`, `meta`, `description`, `demoKey`, then drop the build into `public/demos/<demoKey>/` and set `demoAvailable: true`.
- **`assets`** — 3D model showcase (e.g. Sketchfab). Add an object with `title`, `meta`, `image`, `link`.

## Adding a game demo

1. Export the game to WebGL.
2. Copy the build into `public/demos/<demoKey>/` so `index.html` is the entry point.
3. Add the entry to the `games` array in `src/data/projects.ts` and set `demoAvailable: true`.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Fonts:** Space Grotesk + JetBrains Mono (via next/font)
- **Deploy:** GitHub Pages (static export)
