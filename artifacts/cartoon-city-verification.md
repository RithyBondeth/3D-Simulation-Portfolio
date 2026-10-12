# Colorful miniature city verification

Verified on 12 October 2026 against the production preview at `http://localhost:4173/`.

## Automated checks

- `npm test`: all 16 tests passed, covering vehicle handling, collision bounds, road continuity, the left-to-right route, camera interpolation, and AI project classification.
- `npm run build`: TypeScript and Vite production build passed. The lazy-loaded Three.js scene is approximately 1.10 MB minified / 300 KB gzip. Vite retains its chunk-size advisory. The interface and portfolio content are separate chunks.
- `git diff --check`: passed.
- No runtime dependencies were added.

## Browser checks

- The introduction displays pastel towers, rounded trees, a flower garden, a striped hot air balloon, a crosswalk, the blue M4, and the original featured project previews.
- The Creative park chapter changes the copy, camera view, and M4 position. Its camera was pulled back and aimed nearer the road so the M4 remains visible alongside the park. A native vertical scroll over the mobile canvas advances to Selected work without trapping the page.
- The floating **Say hello** button opens the existing Contact panel, including public email, copy button, social profiles, and location. Closing it restores the city.
- The Apsara Agentic featured preview opens its real case study with the project summary, technologies, implementation sections, outcome, and original links.
- The animation pause control freezes the balloon position; its DOM bounding box remained identical across observations while paused. Resuming restores motion.
- Mobile steering and pedal controls remain available. Holding Accelerate reached 38 km/h; holding Brake returned the car to 0 km/h. Returning to the portfolio restored the previous view.
- Day/night switches the world and interface palette. The customized DETH X RANA plate is visible on the M4 in driving mode.
- Responsive checks included desktop and a 390 × 844 CSS-pixel phone viewport. At the phone size, `document.documentElement.scrollWidth` equalled the 390-pixel viewport width. All five scene toolbar controls, direct portfolio links, chapters, driving entry, and featured projects remained available.

Ambient animation uses a shared 30 fps clock with tab-visibility and canvas-intersection checks. Panels and explicit Pause suspend it. Reduced motion disables ambient animation and uses static chapter positions; that preference path was reviewed in code, without changing the user's system preference.

The earlier [pavilion verification](pavilion-verification.md) records the full existing project-case-study, Simple view, route, and input-lifecycle checks. Current work changes the city's art direction and ambient details while retaining that portfolio content and vehicle handling.

## Screenshots

- [Desktop introduction](cartoon-city-desktop.jpg)
- [Creative park](cartoon-city-park.jpg)
- [Phone introduction](cartoon-city-mobile.jpg)

These images show the running interactive experience. The environment is procedural cartoon geometry, with a detailed licensed M4 adapted to satin blue paint. Existing source and screenshots from preceding designs remain available.
