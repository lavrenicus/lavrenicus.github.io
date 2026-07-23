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

## Adding a Demo

1. Export the game to WebGL.
2. Copy the build into `public/demos/<project>/` so `index.html` is the entry point.
3. Update `src/data/projects.ts` to add the card and demo tab.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Fonts:** Space Grotesk + JetBrains Mono (via next/font)
- **Deploy:** GitHub Pages (static export)
