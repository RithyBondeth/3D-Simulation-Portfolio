# Coastal pavilion verification

Verified on 12 October 2026 against the production preview at `http://localhost:4173/`.

## Automated checks

- `npm test`: 16 tests passed. Covers acceleration, braking, reverse, steering, coasting, suspended frames, architectural and shoreline collisions, the complete coastal road, a clear left-to-right cinematic route, camera continuity at chapter stops, and AI project classification.
- `npm run build`: TypeScript and Vite production build passed. Vite retains its size advisory for the lazy-loaded Three.js scene: approximately 1.09 MB minified / 298 KB gzip. The interface is approximately 308 KB / 93 KB gzip; portfolio content loads separately.
- `git diff --check`: passed.

## Native browser checks

Tested the desktop viewport at 1280 × 720 and phone overrides at 390 × 844 and 390 × 667, then restored the default viewport.

- The opening view shows Bondeth’s name, role, direct portfolio navigation, the larger architectural scene, M4, and three real featured projects.
- Chapter buttons scroll between introduction, selected work, courtyard/AI experiments, and contact. The car changes position along the coastal road while the camera transitions through connected views.
- A native vertical scroll over the phone’s 3D canvas advanced the page to the selected-work chapter; the scene did not trap scrolling.
- Both phone layouts stayed within the viewport width. The scene, chapter controls, optional driving entry, and project strip remained accessible. The 390 × 667 stage measured 595 pixels high and its featured strip ended at the viewport bottom.
- The Apsara Agentic featured preview opened its actual case study with summary, technologies, implementation details, outcome, and original project links. Closing the panel returned to the scene.
- Optional mobile driving displayed touch steering, accelerator, reverse, and brake controls. Holding the accelerator produced a live 44 km/h reading; holding the brake stopped at 0 km/h.
- The M key switched into and out of manual driving. The portfolio scroll position was restored exactly (1468.5 pixels before and after).
- Simple view loaded the project filters and cards. Selecting All displayed “17 projects to discover”. Switching back restored the 3D portfolio.
- Day/night toggled the interface and world lighting. The final contact chapter included the existing PDF resume link.
- No error-level browser console messages were observed.

Reduced motion is implemented with discrete chapter camera/car positions and no drive-in, interpolated camera movement, water motion, or interface transitions. This path was inspected in code; an operating-system preference override was not used during browser verification.

## Screenshots

- [Desktop introduction](pavilion-desktop.jpg)
- [Selected work and M4 close-up](pavilion-work.jpg)
- [Courtyard and experiments](pavilion-courtyard.jpg)
- [Beach and pier](pavilion-coast.jpg)
- [Evening lighting](pavilion-night.jpg)
- [Phone layout](pavilion-mobile.jpg)

These are screenshots of the running Three.js experience, not concept renders. The pavilion is a stylized architectural scene with physical materials, HDR lighting, textured asphalt, and a detailed licensed M4 model. It does not use photogrammetry or a vehicle physics simulator.
