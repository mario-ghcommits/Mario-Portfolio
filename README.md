# Mario Lin — Curiosity, made tangible.

Personal portfolio redesigned with Impeccable in a light, Apple-inspired visual language and purposeful motion informed by Emil Kowalski's published interaction guidance.

## Develop

```sh
pnpm install
pnpm dev
```

## Build and deploy

```sh
pnpm build
```

Vercel settings: Vite preset, `pnpm build`, output `dist`, production branch `main`. Hosting connection was blocked by Vercel team-scope access; no successful deployment is claimed.

## Experience

- ThreeUI's MIT-licensed liquid-form shaders, with a project-owned renderer for continuous pause/resume and visibility handling.
- Authored Three.js geometric city with assembled/exploded systems views, deferred until near the viewport.
- Inline accessible project disclosure, spring-based view selector, and robotics/code switcher.
- Direct city manipulation with pointer capture and projected momentum, keyboard rotation, and reset. Mobile layout, keyboard focus, reduced-motion support, manual animation control, reduced-transparency and increased-contrast fallbacks.
- No analytics, form backend, or collection of contact information.

The interactive Auquara model is reconstructed from four user-supplied photos. Dimensions and obscured surfaces are estimates: the nominal board is 190 × 380 mm. Original photos are not distributed. Geometry is shared between the website, GLB assembly, and editable OpenSCAD export. Edit `src/auquaraModel.js`, then run `pnpm model:export` to regenerate `public/models/`. Open `auquara.scad` in OpenSCAD and adjust `scale_factor` to resize it. Factual content comes from his LinkedIn profile as read in October 2026. Graduation is expected; volunteer dates reflect the listed term.

Edit `src/main.jsx` for content, `src/CityScene.jsx` for city geometry and drag interaction, `src/physics.js` for spring behavior, and `src/style.css` for styling. Full ThreeUI license is shipped in `public/third-party-notices.txt`. Durable context lives in `PRODUCT.md`, `DESIGN.md`, and `.impeccable/`.

Credits: [ThreeUI](https://threeui.com), [Emil Kowalski's motion guidance](https://emilkowal.ski/ui/good-vs-great-animations), and [Mario Lin on LinkedIn](https://www.linkedin.com/in/mario-lin-0773aa409/).

The finished reconstruction infers ceilings over the brown tower shells, completes the partially covered quartered satellite, and extrudes the drawn parcels on the flat satellite. Inferred components are marked in auquara-design.json. Deliberate circular openings and gray courtyard roof openings remain.
