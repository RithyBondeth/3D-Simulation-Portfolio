# Island and project districts verification

Updated 12 October 2026 on `bondeth/island-scroll-redesign`.
Production preview: `http://localhost:4174/`.

## Automated checks

- `npm test`: all 24 tests pass.
- The route test samples 2,001 positions, checks all four sides of the island, verifies the complete circuit closes, and checks continuous position and heading while staying on unblocked asphalt.
- Camera interpolation is checked throughout the route, including every chapter stop. Vehicle bounds are projected at 201 route positions across three canvas aspect ratios.
- Existing acceleration, braking, reversing, steering, collision, off-road, shoreline, and project classification tests pass.
- Pedestrian and cycle paths are sampled at 501 positions, checking land bounds, separation from asphalt, and clearance from district buildings and structures. Cycle-loop position and heading close continuously; manual driving stops before the parked electric shuttle.
- `npm run build`: TypeScript and production build pass. No runtime dependencies were added. Vite retains its existing advisory for the approximately 1.11 MB Three.js chunk (303 KB gzip).
- District tests use the real portfolio records, verify that every project has exactly one home and matching gallery filter, and sample 2,001 scroll positions to prove that the complete circuit reveals every project.
- A Vite/React server-rendering test confirms the default gallery renders all 17 cards, each district renders its matching collection, every case study renders, and navigation displays the correct totals. Current collection sizes: AI 4, Web 10, Mobile 2, macOS 1.
- `git diff --check`: passes.

## Current browser verification limitation

The latest project-district update could not be inspected in the live browser: the browser tool rejected opening `http://localhost:4174/` under its URL policy. No workaround was attempted. The checks above verify the code and rendered gallery markup; visual layout and click interactions for this update remain unverified.

## Earlier live browser checks

Before the project-district navigation and footbridge were added, the production build was inspected at desktop and phone viewport sizes using the Codex browser. Checks confirmed:

- The brighter island and text-only selected-work strip render. No project screenshots are used as scene textures.
- The expanded district renders its 12 additional buildings, rooftop solar panels, wind turbines, waterfront cafés, transit stop and shuttle, EV charging, seating, railings, and cycle lane. Pedestrians and cyclists move independently of scroll on the shared ambient clock.
- All three project text labels are present; clicking Apsara Agentic opens its correct case study and closing it returns to the island.
- Chapter navigation changes the scroll position and opens the playground view. Labels change with the chapter without unmounting their HTML roots.
- Manual driving opens, keyboard acceleration reaches a visible 35 km/h, and returning restores the previous portfolio chapter.
- Day/night lighting updates the world and interface colors.
- Simple view loads the project collection and returns to the 3D island.
- Phone layout has no horizontal document overflow; label widths and camera distance adapt to the narrower scene.
- Production logs show no application errors during these interactions. Three.js reports its existing Clock deprecation warning.

Earlier desktop preview: [island-district-desktop.jpg](island-district-desktop.jpg).
Earlier phone preview: [island-district-mobile.jpg](island-district-mobile.jpg).

## Implementation notes

The 301-metre circuit shares the existing road and collision plan. Scroll progress follows the route with damping; wheel rolling and steering follow its distance and tangent. The camera orbits from outside the road so the car stays on the visible side. A miniature route map tracks scroll progress on desktop. Reduced-motion preferences retain static district positions and disable ambient motion and pointer parallax.

The scene retains the original M4 and Cambodian plates. New clouds, birds, flowers, ripples, and sailboat are procedural. Project screenshots remain available inside case studies. Existing portfolio content, links, and Simple view are preserved.

Mobile GPU performance and every hardware/browser combination were not benchmarked. Ambient animation retains the existing visibility-aware 30 fps budget.

The district batches static boxes into two instanced meshes and the 28 pedestrians into three. Three cyclists and two turbines use small animated groups. Paused/reduced-motion scenes retain populated initial poses. Tall outer buildings can naturally occlude the car during parts of its circuit; its floating label and route map continue tracking it.

The latest update replaces three fixed project labels with four district sculptures: an AI gyroscope, a Web frame, a phone, and a MacBook. One label is active at a time. Its project changes with scroll progress and has wrapping previous/next controls, a counter, and a link to the district gallery. District navigation pins a category and moves to its route stop; Follow car and chapter navigation restore automatic discovery. Manual driving selects the district from car position. Counts and project metadata derive from `content.json`; no project screenshots are scene textures. The waterfront includes an arched timber footbridge and a harbour lookout, built into the existing instanced batches.
