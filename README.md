# Lavrenicus portfolio

Static site, no build step. GitHub Pages ready.

## Structure

- `index.html` — main page
- `css/style.css` — Cyber Terminal theme (electric blue)
- `js/script.js` — demo tab switching
- `demos/<project>/` — drop each WebGL build here as `index.html` + assets

## Deploy on GitHub Pages

1. Push this folder as the repo root (or `/docs`).
2. Repo settings → Pages → deploy from branch, root (or `/docs`).
3. Site goes live at `https://<username>.github.io/<repo>/`.

## Adding a demo

1. Export the game to WebGL (Unity: `File → Build Settings → WebGL`; Babylon.js: bundle with your existing build tooling).
2. Copy the exported files into `demos/<project>/` so `demos/<project>/index.html` is the entry point.
3. In `js/script.js`, the `demoPaths` object already points at the four placeholder folders — update the key names if project names change.

## Editing content

Project cards, tech list, and about text all live directly in `index.html` — no CMS, just edit the markup.
