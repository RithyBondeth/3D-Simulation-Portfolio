# Bondeth World — 3D Portfolio

Explore Rithy Bondeth’s portfolio at [3d.bondeth.dev](https://3d.bondeth.dev/). Scrolling drives the BMW M4 through six chapters, across the bridge and around Innovation island. Manual driving, elevated trains, project districts, night lighting and the waterfront share one world. Simple view provides the complete portfolio without WebGL. Full case studies open on [bondeth.dev](https://www.bondeth.dev/en).

## Development

Node.js 22.18 or newer is required. No API keys or environment variables are needed.

```sh
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173/).

| Command                           | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| `npm run check`                   | Run formatting, unused-code, type, test and build checks      |
| `npm run format` / `format:check` | Apply or check consistent formatting                          |
| `npm run lint:unused`             | Find unused files, exports, types and dependencies            |
| `npm run typecheck`               | Check strict TypeScript, including unused declarations        |
| `npm test`                        | Run behavior, architecture and asset tests                    |
| `npm run build` / `preview`       | Build or preview the production site                          |
| `npm run assets:social`           | Regenerate social previews from local fonts and Byte geometry |

CI enforces formatting, unused-code checks, tests and the production build. The build also type-checks. The Three.js chunk retains Vite’s size advisory.

## Structure

```text
src/
├── app/                    # Composition, navigation and mode coordination
├── application/            # Lifecycle hooks and interaction contracts
├── domain/
│   ├── brand/              # Byte geometry and palettes
│   ├── portfolio/          # Sections, classification and URL rules
│   └── world/              # Layouts, physics, routes and train/boat schedules
├── data/portfolio/         # Shared profile, records and editorial selections
├── infrastructure/build/   # Static legacy-project redirect generation
└── presentation/
    ├── interface/          # Settings, minimap, touch controls, help and footer
    ├── portfolio/          # Gallery and individual portfolio sections
    ├── shared/             # Brand, dialog and error boundary
    ├── styles/             # Fonts, tokens and styles in cascade order
    └── world/              # Scene, landmarks, fleet and vehicles
        ├── geometry/       # Render-specific bridge and road mesh builders
        └── rendering/      # Shared instancing, primitives and palette
tests/                      # Behavior, architecture and asset checks
public/                     # Referenced assets and documented editable sources
artifacts/                  # Current scene verification screenshots
scripts/                    # Social preview generation
```

Domain modules depend only on other domain modules and contain no React, Three.js or browser state. Application and presentation code depend inward on these rules. Shared mesh utilities belong to rendering rather than district components.

See [architecture rules](docs/architecture.md) for dependency boundaries and asset ownership. Tests enforce those boundaries and reject circular imports.

## Controls

| Input                                      | Action                                       |
| ------------------------------------------ | -------------------------------------------- |
| Scroll / vertical swipe                    | Follow the route; scrolling back retraces it |
| Destination buttons                        | Open a portfolio section                     |
| **M**                                      | Switch between portfolio and manual driving  |
| **W / ↑**, **S / ↓**, **A / D**, **← / →** | Accelerate, brake/reverse and steer          |
| **Space** / **E**                          | Brake / open a nearby destination            |
| **R** / **1–6** / **?** / **Esc**          | Reset / open chapters / help / close panel   |

World settings provide day/night lighting, sound, animation pause and Auto, Detailed or Battery saver graphics. Ambient animation respects reduced motion and page visibility. Phones have steering and pedal controls.

The build emits 17 static legacy documents at `/projects/<id>/`. Serve those directories before any SPA fallback. They redirect to matching canonical case studies with a fallback link that works without JavaScript. Older query-based links are handled by the app.

## Assets and license

See [ASSETS.md](ASSETS.md) and [model attribution](public/models/ATTRIBUTION.md). Fonts and runtime media are hosted locally. Superseded scenes, unused media and historical verification exports have been removed; Git history retains them.

[Rithy Bondeth](https://bondeth.dev) — Full Stack Developer & AI Engineer. Distributed under the [MIT License](LICENSE).
