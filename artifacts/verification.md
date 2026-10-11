# Bondeth Island verification

Checked on 11 October 2026. The earlier studio screenshots and reports are historical; the files prefixed `island-` and `lighthouse-island-` describe the outdoor version.

## Build and logic

- `npm run build`: TypeScript and production build passed.
- `npm test`: all 11 tests passed. Nine cover driving, braking, reverse, steering, building collisions, island bounds, off-road limits, coasting, and suspended frames; two cover AI project classification.
- 22 local assets returned HTTP 200, including the BMW GLB, portfolio previews, portrait, and resume.
- The M4 checksum matches its attribution record. The 3.9 MB compressed GLB is served locally.
- The Three.js scene is lazy loaded (approximately 1,087 kB / 297 kB gzip). Vite reports its normal large-chunk advisory. Portfolio panels load separately.

## Native browser checks

- Desktop at 1440 × 900 CSS pixels and phone at 390 × 844. No horizontal document overflow.
- The outdoor scene renders the M4, coastal road loop, boulevard, five buildings, vegetation, waterfront, and island overview.
- Keyboard acceleration changed the actual speed readout and minimap position. Combined forward/right input changed heading; Space stopped the car. The chase camera followed.
- Phone acceleration was held using native pointer input; the speedometer, distance, and map updated. Steering and throttle use separate axes for simultaneous touch input.
- The full island map switched to the orthographic camera; returning restored the driving camera. Manual drag and scroll changed orbit and zoom. Reset restored the initial car/camera position.
- E opened Selected work at the initial nearby destination. The minimap opened AI labs, skills, biography, and career; all five destinations remained available through the dock.
- Project search narrowed to Apsara Agentic. Its real case study, technology list, and live product link opened inside the content panel. Original project content is preserved.
- Toolkit showed seven groups. Career showed six roles and the degree. Biography, AI lab links, and contact opened correctly. Email links retain the original public address.
- Native dialogs focused the close button and dismissed with Escape. Opening a panel stopped driving.
- Day and night rendered. Simple view contained the searchable portfolio with zero canvases; 3D view returned to the island.
- Both toolbar help and the footer Controls & credits button opened the guide, including visible model author/source/license links.
- No application errors appeared in the browser console. React Three Fiber currently emits a nonfatal Three.Clock deprecation warning from a dependency.
- Reduced motion behavior was reviewed in code: instant chase-camera positioning and disabled interface transitions, with manual driving retained. No OS preference was changed.

## Lighthouse

Lighthouse 13.5 audited the production preview on localhost. Desktop used its desktop preset; mobile used the default network and CPU simulation. Scores are lab measurements, not guarantees for real phones or hosting. Camera-input polish and the contact shadow were subsequently adjusted without changing the loading architecture or UI content.

| Mode | Performance | Accessibility | Best practices | SEO | LCP | Blocking time | Layout shift |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | 99 | 100 | 100 | 100 | 0.8 s | 0 ms | 0.001 |
| Mobile | 66 | 100 | 100 | 100 | 3.9 s | 680 ms | 0.002 |

Automated accessible-name, label-in-name, contrast, and target-size checks passed. Automated results do not establish complete accessibility conformance. The detailed car and WebGL initialization remain the main mobile loading cost; a loading state and Simple view are available.

Reports: [desktop](lighthouse-island-desktop.json), [mobile](lighthouse-island-mobile.json).

## Screenshots

- [Desktop driving](island-desktop.png)
- [Full island map](island-map.png)
- [Phone controls](island-mobile.png)
- [Night driving](island-night.png)

## Scope

This is a locally running static website. It has not been deployed. Contact opens an email client; AI playgrounds, live projects, full original case studies, and social profiles link to existing public destinations. Handling is arcade-style; vegetation is decorative, and collision boundaries cover building footprints, the central fountain, and the coast.
