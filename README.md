# Bondeth World — an interactive 3D portfolio

Rithy Bondeth’s portfolio inside a floating cartoon world, built with React, TypeScript, Three.js, React Three Fiber, and Vite. Scroll through four connected camera views: arrival, selected work, the AI portal, and contact. The island includes sculpted towers, rooftop gardens, four interactive project districts, a hovering companion, sky trams, floating satellite islands, a ringed planet, and an animated waterfall. A blue BMW M4 drives a complete 301-metre circuit around the island as you scroll, with continuous turns, rolling wheels, and an orbiting camera. Manual driving is also available. The brighter editorial layout frames a sunlit diorama with clouds, birds, garden flowers, and a small sailboat.

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

The production preview defaults to http://localhost:4173 (Vite uses the next available port when occupied). Serve `dist/` with any static host. No API keys or environment variables are required.

## Explore

- Scroll vertically or use the four chapter buttons to follow the M4 through the world.
- Open Work, About, Toolkit, Journey, AI lab, and Contact directly from the interface.
- All 17 projects belong to one of four districts: AI (4), Web (10), Mobile (2), and macOS (1). A single active text label changes district and project as the car follows the route. Previous/next controls browse that district; clicking the project opens its case study. Project screenshots appear only inside case studies.
- Choose a district along the bottom to visit its landmark and pin its selection. **Follow car** restores automatic discovery. Chapter navigation also restores automatic discovery.
- **All work** in the header and **Explore all 17 projects** in the district strip open the complete searchable gallery. **All AI / Web / Mobile / macOS** on a landmark opens its matching filtered collection. The gallery defaults to All; Featured remains an optional filter.
- The flying companion opens About, the animated portal opens the AI lab, and the floating contact beacon opens Contact. Chapter-specific labels keep the scene readable.
- Choose **Take the wheel** for manual driving. **M** switches modes and restores the previous portfolio scroll position.
- **W / Up** accelerates, **S / Down** brakes into reverse, **A / D** or **Left / Right** steers, and **Space** brakes. Drag to orbit; scroll or pinch to zoom.
- **E** opens a nearby destination while driving. **R** resets; **1–5** opens destinations; **?** opens controls and asset credits. **Escape** closes a panel.
- Phones have separate steering and pedal controls with simultaneous touch support. The scroll-driven scene allows vertical touch scrolling.
- The scene toolbar offers day/night lighting, optional interaction sounds, ambient animation pause/play, reset, and help. **Simple view** provides all portfolio content without WebGL.

The expanded district adds 12 buildings with varied heights, solar rooftops, planted terraces, and two wind turbines. Waterfront cafés, benches, recycling bins, railings, solar streetlights, an electric shuttle and sheltered stop, EV charging bays, and bike parking connect the neighbourhood. Twenty-eight articulated pedestrians follow four sidewalk loops; three cyclists ride a separate waterfront cycle lane. Building windows and street lamps glow at night. A timber footbridge arches over the waterfront canal to a small harbour lookout. Repeated architecture and street details share two instanced geometry batches; pedestrians use three more.

Driving retains acceleration, coasting, braking, reversing, speed-dependent steering, slower unpaved surfaces, building collisions, and the waterfront boundary. The road and architectural footprints are shared between the rendered world and vehicle handling, including the new buildings, cafés, transit shelter, shuttle, and charging posts. Decorative trees, street furniture, people, sky traffic, and floating props are not collision obstacles.

Content panels suspend the car, camera, and ambient animation. Held inputs clear on blur and tab visibility changes. Ambient motion shares a 30 fps clock and stops offscreen, in hidden tabs, or when paused. Reduced motion disables ambient animation and pointer parallax, uses static district views. Manual driving remains available.

## Content and implementation

All 17 project profiles, six career roles, seven skill groups, portrait, PDF resume, and original public project links are preserved. Contact opens the visitor’s mail app or copies the public email address.

- `src/App.tsx`: portfolio navigation, sticky scroll stage, chapter copy, district selection, dialogs, and manual-driving mode.
- `src/components/DistrictBrowser.tsx`: category navigation, project counts, automatic-discovery control, and the full-gallery entry point.
- `src/project-catalog.ts`: island project metadata derived directly from the original portfolio records.
- `src/lib/project-districts.ts`: exclusive district classification, shared gallery filters, route discovery, and manual-driving proximity.
- `src/components/MetaverseWorld.tsx`: procedural island terrain, layered foundations, architecture, district sculptures and text landmarks, portal and waterfall shaders, companion, contact beacon, sky traffic, stars, and satellite islands.
- `src/components/DrivingWorld.tsx`: lighting, HDR reflections, licensed M4, rolling wheels, cinematic/chase cameras, desktop pointer parallax, and input lifecycle.
- `src/components/IslandAtmosphere.tsx`: low-poly clouds, birds, flowers, shoreline ripples, and a gently rocking sailboat.
- `src/components/IslandDistrict.tsx`: instanced neighbourhood architecture, renewable energy, waterfront cafés, transit infrastructure, and public-space details.
- `src/components/IslandPeople.tsx`: articulated pedestrians and cyclists using the shared ambient motion clock, including static initial poses when paused.
- `src/lib/island-district.ts`: shared district footprints, pedestrian routes, and the continuous cycle circuit.
- `src/components/CartoonMotion.tsx`: shared animation clock and visibility-aware render scheduling.
- `src/lib/coastal-journey.ts`: chapter stops, camera field of view, cinematic route, and continuous camera interpolation.
- `src/lib/pavilion-layout.ts`: shared road geometry, architectural footprints, collision bounds, and shoreline. The world reuses this compact, tested plan.
- `src/lib/driving.ts`: deterministic vehicle handling and collision resolution.
- `src/components/PortfolioContent.tsx`: searchable projects, case studies, biography, skills, career, AI labs, and contact.
- `src/content.json` and `src/profile.json`: canonical portfolio records and interface profile. The earlier pavilion retains its separate featured selection.
- `src/metaverse.css`: world interface, district strip, route minimap, interactive text markers, responsive layouts, and interaction states. Earlier shared interface styles remain in `pavilion.css`, `studio.css`, and `styles.css`.

Earlier room, city, and pavilion scene components remain in the repository as design history and are not imported into the current world. Fonts and assets are hosted locally. Existing theme and view preferences remain compatible.

## Validation and assets

Twenty-four Node tests cover vehicle handling, collision bounds, continuous roads, a full circuit with continuous vehicle tangents, camera interpolation, vehicle projection bounds, pedestrian/cycle separation from the driving circuit, cycle-loop continuity, parked-shuttle collision, project classification, complete district discovery, shared gallery filters, and rendering every project/case study. See [current verification](artifacts/metaverse-verification.md) for checks and limitations. Earlier screenshots document their respective previous designs.

The Three.js scene and portfolio interface are lazy loaded. Project records are shared with the opening-page district catalogue so the island and gallery stay in sync. The M4 is approximately 3.9 MB. Vite retains its size advisory for the Three.js bundle. A WebGL error provides a Simple view fallback.

Asset licenses are documented in [ASSETS.md](ASSETS.md) and [model attribution](public/models/ATTRIBUTION.md). The user’s custom **DETH X RANA** Cambodian-style plate remains on the front and rear.
