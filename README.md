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

- The hero loads the Pegasus fsaverage5 cortical model from commit 52ba71e3b4bb53063eff035a6e2223388889ca1c. About 65% of its solid puzzle volume stays assembled in distributed cells; 37 rounded pieces fill scattered gaps across the whole brain, hold complete for one second, then reset and rebuild. Drag rotates independently, arrow keys rotate, and Home resets. Reduced motion starts at the complete state; pausing retains the current frame. The previous ThreeUI shaders remain as licensed reference material.
- Authored Three.js geometric city with assembled/exploded systems views, deferred until near the viewport.
- Inline accessible project disclosure, spring-based view selector, and robotics/code switcher.
- Direct city manipulation with pointer capture and projected momentum, keyboard rotation, and reset. Mobile layout, keyboard focus, reduced-motion support, manual animation control, reduced-transparency and increased-contrast fallbacks.
- No analytics, form backend, or collection of contact information.

The interactive Auquara model is reconstructed from four user-supplied photos. Dimensions and obscured surfaces are estimates: the nominal board is 190 × 380 mm. Original photos are not distributed. Geometry is shared between the website, GLB assembly, and editable OpenSCAD export. Edit `src/auquaraModel.js`, then run `pnpm model:export` to regenerate `public/models/`. Open `auquara.scad` in OpenSCAD and adjust `scale_factor` to resize it. Factual content comes from his LinkedIn profile as read in October 2026. Graduation is expected; volunteer dates reflect the listed term.

Edit `src/main.jsx` for content, `src/CityScene.jsx` for city geometry and drag interaction, `src/physics.js` for spring behavior, and `src/style.css` for styling. Full ThreeUI license is shipped in `public/third-party-notices.txt`. Durable context lives in `PRODUCT.md`, `DESIGN.md`, and `.impeccable/`.

Credits: [ThreeUI](https://threeui.com), [Emil Kowalski's motion guidance](https://emilkowal.ski/ui/good-vs-great-animations), and [Mario Lin on LinkedIn](https://www.linkedin.com/in/mario-lin-0773aa409/).

The finished reconstruction infers ceilings over the brown tower shells, completes the partially covered quartered satellite, and extrudes the drawn parcels on the flat satellite. Inferred components are marked in auquara-design.json. Deliberate circular openings and gray courtyard roof openings remain.

Auquara uses light-blue offices, white housing, and gray factories with paved ground and separate lawns, sage pocket parks, perimeter plantings, 21 stylized trees, and four roof gardens. Landscaping is an authored addition.

Both the outer board and central city platform are rectangular, while circular city routes remain.

Appearance: the header toggle switches Light/Dark and saves the preference locally. Dark mode uses light primary text, high-contrast secondary text, and dark backgrounds across chrome, controls, project stages, code, stories, and footer. The appearance button text is explicitly light.

## Brain geometry

Run `pnpm brain:check` to validate solids and the one-second completed hold. Run `pnpm brain:build` to regenerate the solid CSG-cut model from `public/models/pegasus-fsaverage5.glb`. The original Pegasus implementation and MIT license are in `src/vendor/pegasus/`; notices ship in `public/third-party-notices.txt`. Source: [Pegasus Brain3D.tsx](https://github.com/rishith-c/pegasus/blob/52ba71e3b4bb53063eff035a6e2223388889ca1c/frontend/src/components/Brain3D.tsx). Geometry build dependencies run offline and are excluded from the browser bundle. The FreeSurfer model illustrates the portfolio and is not used for medical interpretation.

Auquara’s default orthographic view aligns with the platform edges so the rectangular footprint is visible as a rectangle. Its offices are light blue, housing white, and factories gray; paved ground is broken up by pocket lawns and planting beds. Outer modules are blue offices or gray factories. The CAD preserves right-angle rectangular boards.

Assembly direction: missing brain cells are scattered throughout all four vertical bands and across both hemispheres. Arrival order is shuffled, with varied outward approaches and curved paths; no horizontal cutout plane remains. The one-second fully assembled hold is preserved.
