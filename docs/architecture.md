# Architecture and maintenance

This client-side React application keeps pure simulation and portfolio rules at its center. It uses concrete modules rather than service containers, generic repositories or an application framework.

## Dependency direction

| Layer            | May import                                                         |
| ---------------- | ------------------------------------------------------------------ |
| `domain`         | Domain modules only                                                |
| `application`    | Application and domain; React hooks and types                      |
| `data`           | Data and domain                                                    |
| `infrastructure` | Infrastructure and domain; build/runtime libraries                 |
| `presentation`   | Presentation, application, domain and data; UI/rendering libraries |
| `app`            | App, presentation, application, domain and data                    |

`main.tsx` is the bootstrap. `app/App.tsx` composes lazy views and coordinates navigation, browser events, driving mode and preferences. It does not define scene geometry or portfolio sections. Application hooks own reusable lifecycle behavior; `world-contract.ts` defines callbacks and inputs.

Domain modules cannot import external packages or browser state. URL parsing receives a URL string as an argument and uses the standard `URL` value type. Driving, collisions, camera shots, train schedules and boat routes are deterministic functions that run without WebGL.

The data folder contains local records and derives the island catalog from them. One `profile.json` supplies shared contact details. Project records contain the fields this site uses; full case studies remain on the primary portfolio.

## Rendering ownership

`WorldCanvas` configures the renderer and camera. `DrivingController` owns interaction and applies driving rules. `BmwModel` owns model customization and wheel animation. `IslandScene` composes terrain, architecture, landmarks, the bridge and trains. `SceneMotion` provides the visibility/pause/reduced-motion clock.

Three.js mesh builders and resources stay under `presentation/world`. `rendering/InstancedBoxes.tsx` provides shared box instancing. Geometry builders depend on its mesh description type without importing a district component. Resources created by components retain explicit cleanup.

Portfolio sections, dialogs, controls and markers retain semantic buttons and links, keyboard access and accessible names. Check structural changes in desktop and compact layouts.

Styles stay in the presentation layer. Their cascade order is preserved in `styles/app.css`; moving rules requires checking responsive behavior and theme overrides. Classes describe current roles rather than previous scene designs. Preserve dynamic chapter, portfolio-section and skill-group variants during stylesheet audits.

## Maintenance checks

1. Put deterministic rules in `domain`, records in `data`, and UI/Three.js details in `presentation`.
2. Import owning modules directly. Avoid barrel files and circular dependencies.
3. Keep component and file names consistent. Prefer descriptive domain names such as `isWorldBlocked` and `scroll-journey`.
4. Mark type-only imports explicitly.
5. Run `npm run check`. TypeScript rejects unused declarations; Knip checks unused files, exports and packages; tests enforce dependency direction, cycles and asset references; Prettier checks formatting.

Fontsource packages are retained explicitly in `knip.json` because their imports live in CSS, which Knip does not trace as TypeScript. These are active dependencies. CI runs the same checks.

## Assets

Every public runtime asset must be referenced by source, data, HTML or the social-preview generator. The asset test explicitly retains only three non-runtime resources:

- `robots.txt`: standard crawler endpoint.
- `models/ATTRIBUTION.md`: required model attribution.
- `textures/cambodia-plate.svg`: editable source for the rendered PNG.

The social-preview generator references its output files. Preserve editable sources, licenses and provenance when changing derivatives. New exceptions need a concrete ownership reason in the test and documentation. Historical screenshots and implementations are recoverable from Git; `artifacts` holds current verification images.
