# Portfolio visual improvements — 13 October 2026

## Delivered

- Two scenic island annexes with a rotating observation wheel, lighthouse and night beacon, arched pedestrian bridges, gardens, a small bookshop, and a drifting striped balloon.
- A wider overview camera composition. The existing driving bounds and collision layout remain intact; the additions sit beyond the drivable circuit.
- Smaller floating project annotations, with descriptions revealed on hover or keyboard focus, and smaller header work labels.
- A drawn SVG Bondeth monogram shared by the header and standard-view illustration, plus a matching SVG favicon.
- A standard-view introduction for each portfolio section, an original studio illustration, larger two-column project previews, updated About, Skills, Experience, Labs, and Contact layouts, responsive navigation, and a theme control.
- A fix for a reproduced production error when switching views. A visited scene stays mounted, hidden, and paused while the standard view is open. Starting directly in the standard view does not mount a canvas.

## Verification

- `npm run build`: passed TypeScript and the production Vite build.
- `npm test`: 24 passed, 0 failed. Existing checks cover driving, collisions, pedestrians, route continuity, project districts, filtering, and all project galleries and case studies.
- `git diff --check`: passed.
- Browser checks at 1440 × 1000, 390 × 844, and 320 × 740. No horizontal document overflow at the tested mobile widths.
- Checked light and dark appearances, About, Skills, Experience, Labs, and Contact navigation, animation pause, project filtering, search, the empty state, and opening a project case study.
- Five repeated production round trips between 3D and standard views: no console errors. Exactly one visible main landmark and one `main-content` ID in the standard view. A loaded canvas is retained across switches.
- Clean standard-view load: zero canvases, all 17 project cards rendered.

The existing large 3D bundle still produces Vite's chunk-size advisory. Three.js also logs a dependency-level `Clock` deprecation warning in development. No new runtime dependency was added.

## Previews

- `island-redesign-desktop.jpg`
- `island-redesign-mobile.jpg`
- `portfolio-redesign-desktop.jpg`
- `portfolio-redesign-mobile.jpg`
