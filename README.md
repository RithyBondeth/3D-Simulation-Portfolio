# Bondeth World — an interactive 3D portfolio

Rithy Bondeth’s portfolio inside a floating cartoon world, built with React, TypeScript, Three.js, React Three Fiber, and Vite. Scroll through four connected camera views: arrival, selected work, the AI portal, and contact. The island includes sculpted towers, rooftop gardens, project galleries, a hovering companion, sky trams, floating satellite islands, a ringed planet, and an animated waterfall. A blue BMW M4 follows the journey and is available for optional manual driving.

## Run locally

Requires Node.js 22.18 or newer.

```sh
npm ci
npm run dev
```

Development runs at http://localhost:5173. Build and preview the production version:

```sh
npm test
npm run build
npm run preview
```

The production preview runs at http://localhost:4173. Serve `dist/` with any static host. No API keys or environment variables are required.

## Explore

- Scroll vertically or use the four chapter buttons to follow the M4 through the world.
- Open Work, About, Toolkit, Journey, AI lab, and Contact directly from the interface.
- Click a 3D project screen or a featured project in the floating dock to open its individual case study.
- The flying companion opens About, the animated portal opens the AI lab, and the floating contact beacon opens Contact. Chapter-specific labels keep the scene readable.
- Choose **Drive the M4** for manual driving. **M** switches modes and restores the previous portfolio scroll position.
- **W / Up** accelerates, **S / Down** brakes into reverse, **A / D** or **Left / Right** steers, and **Space** brakes. Drag to orbit; scroll or pinch to zoom.
- **E** opens a nearby destination while driving. **R** resets; **1–5** opens destinations; **?** opens controls and asset credits. **Escape** closes a panel.
- Phones have separate steering and pedal controls with simultaneous touch support. The scroll-driven scene allows vertical touch scrolling.
- The scene toolbar offers day/night lighting, optional interaction sounds, ambient animation pause/play, reset, and help. **Simple view** provides all portfolio content without WebGL.

Driving retains acceleration, coasting, braking, reversing, speed-dependent steering, slower unpaved surfaces, building collisions, and the waterfront boundary. The existing compact road and building footprints are shared between the rendered world and vehicle handling. Decorative trees, sky traffic, and floating props are not collision obstacles.

Content panels suspend the car, camera, and ambient animation. Held inputs clear on blur and tab visibility changes. Ambient motion shares a 30 fps clock and stops offscreen, in hidden tabs, or when paused. Reduced motion disables ambient animation and pointer parallax, removes the opening drive-in, and uses static chapter views. Manual driving remains available.

## Content and implementation

All 17 project profiles, six career roles, seven skill groups, portrait, PDF resume, and original public project links are preserved. Contact opens the visitor’s mail app or copies the public email address.

- `src/App.tsx`: portfolio navigation, sticky scroll stage, chapter copy, featured projects, dialogs, and manual-driving mode.
- `src/components/MetaverseWorld.tsx`: procedural island terrain, layered foundations, architecture, interactive project displays, portal and waterfall shaders, companion, contact beacon, sky traffic, stars, and satellite islands.
- `src/components/DrivingWorld.tsx`: lighting, HDR reflections, licensed M4, rolling wheels, cinematic/chase cameras, desktop pointer parallax, and input lifecycle.
- `src/components/CartoonMotion.tsx`: shared animation clock and visibility-aware render scheduling.
- `src/lib/coastal-journey.ts`: chapter stops, camera field of view, cinematic route, and continuous camera interpolation.
- `src/lib/pavilion-layout.ts`: shared road geometry, architectural footprints, collision bounds, and shoreline. The world reuses this compact, tested plan.
- `src/lib/driving.ts`: deterministic vehicle handling and collision resolution.
- `src/components/PortfolioContent.tsx`: searchable projects, case studies, biography, skills, career, AI labs, and contact.
- `src/featured-projects.ts`, `src/content.json`, and `src/profile.json`: existing portfolio records and interface profile.
- `src/metaverse.css`: world interface, floating project dock, markers, responsive layouts, and interaction states. Earlier shared interface styles remain in `pavilion.css`, `studio.css`, and `styles.css`.

Earlier room, city, and pavilion scene components remain in the repository as design history and are not imported into the current world. Fonts and assets are hosted locally. Existing theme and view preferences remain compatible.

## Validation and assets

Seventeen Node tests cover vehicle handling, collision bounds, continuous roads, the left-to-right cinematic route, camera interpolation, vehicle visibility above the project dock, and AI project classification. See [current verification](artifacts/metaverse-verification.md) for checks and limitations. Earlier screenshots document their respective previous designs.

The Three.js scene and portfolio content are lazy loaded. The M4 is approximately 3.9 MB. Vite retains its size advisory for the Three.js bundle. A WebGL error provides a Simple view fallback.

Asset licenses are documented in [ASSETS.md](ASSETS.md) and [model attribution](public/models/ATTRIBUTION.md). The user’s custom **DETH X RANA** Cambodian-style plate remains on the front and rear.
