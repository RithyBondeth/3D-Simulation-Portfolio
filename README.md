# Bondeth Island

An outdoor driving portfolio for Rithy Bondeth. Drive a detailed BMW M4 Competition through a coastal island with five destinations: a project gallery, AI pavilion, tech garden, waterfront house, and career lookout. Built with React, TypeScript, Three.js, React Three Fiber, and Vite.

## Run locally

Requires Node.js 22.18 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Verify and preview the production build:

```sh
npm test
npm run build
npm run preview
```

The production preview runs on http://localhost:4173. Serve `dist/` with any static host. No environment variables or API keys are needed.

## Development workflow

Create a feature branch from `main`, make changes, and open a pull request. GitHub Actions installs the locked dependencies with Node.js 24, runs the tests, and builds the production bundle on every pull request and push to `main`. Merge after the checks pass.

## Drive and explore

- **W / Up:** accelerate. **S / Down:** brake into reverse.
- **A / D** or **Left / Right:** steer. **Space:** brake.
- **E:** open a nearby destination. The arrival button works on touch screens.
- **M:** switch between the chase camera and full island map. **R:** return to the starting position.
- Drag to orbit around the car; scroll or pinch to zoom. The camera follows while driving.
- Click a world marker, minimap destination, or bottom navigation button to open a section directly.
- **1–5:** Work, AI lab, Toolkit, About, and Journey. **?:** controls and asset credits. **Escape:** close a panel.
- Phones have separate steering and pedal controls, supporting simultaneous touches.
- Day/night, optional interaction sounds, reset, and help are at the top right.
- Simple view offers the same portfolio without WebGL.

The dashboard displays actual simulated speed, gear, distance driven, and asphalt/off-road status. The minimap follows the car and identifies the nearest destination. Handling includes acceleration, coasting, braking, reversing, speed-dependent steering, slower grass, building collisions, and an island boundary. This is an arcade driving experience, not a vehicle dynamics simulator. Trees are decorative; building footprints and the fountain block movement.

Driving stops while a content panel or help dialog is open, when the window loses focus, or when the page is hidden. The scene renders on demand and rests when idle. Reduced motion removes camera interpolation and interface transitions while keeping manual driving available.

## Content and implementation

The portfolio content and original images came from the user's existing portfolio, https://www.bondeth.dev/en, and its local source. All 17 project profiles, six career roles, seven skill groups, the portrait, and PDF resume are preserved.

- `src/content.json`: verified projects, case studies, experience, skills, education, and profile.
- `src/profile.json`: the lightweight profile record for the main interface; keep contact/social links in sync.
- `src/components/DrivingWorld.tsx`: island geometry, buildings, roads, vegetation, lighting, M4 rendering, wheel animation, camera, and input lifecycle.
- `src/components/DrivingHUD.tsx`: live vehicle dashboard and interactive minimap.
- `src/lib/driving.ts`: deterministic vehicle handling, road detection, and collision boundaries.
- `src/components/PortfolioContent.tsx`: searchable projects, filters, case studies, biography, toolkit, career, AI labs, and contact.
- `src/driving.css`: full-screen outdoor layout, blue/ivory palette, responsive driving controls, and HUD.
- `src/styles.css` and `src/studio.css`: shared portfolio content, typography, and panel styles retained from the earlier design.
- `public/models/bmw-m4.glb`: locally hosted, compressed M4 model. See [ASSETS.md](ASSETS.md) and [model attribution](public/models/ATTRIBUTION.md).

The earlier room component is no longer imported or included in the build. The interface uses self-hosted Sora, Manrope, Ubuntu, and JetBrains Mono with Phosphor icons. Theme uses `bondeth-island-theme` and starts in daylight. View preference uses `bondeth-view`.

Contact opens the visitor's email app. The copy button copies the public email address. No new message-submission backend was added. AI playgrounds, social profiles, full original case studies, and products link to existing public destinations.

## Validation and assets

Eleven Node tests cover driving behavior, collision boundaries, suspended frames, and AI project classification. Native browser checks cover desktop and phone layouts, acceleration, steering, braking, the overview camera, minimap navigation, touch pedals, content panels, and Simple view.

Screenshots and validation notes are in [artifacts/verification.md](artifacts/verification.md). The Three.js module is lazy loaded separately from the UI and content. The M4 is approximately 3.9 MB and is hosted locally; Vite reports a size advisory for the Three.js chunk. WebGL failure offers Simple view.
