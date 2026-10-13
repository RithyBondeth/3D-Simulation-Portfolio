# Living coastal world verification

Implemented on `bondeth/living-coastal-world` on 2026-10-13.

- Full-stage 3D canvas with a soft reading veil and an offset desktop camera composition.
- Single-pass ocean shader with analytic wave highlights and distance haze; day/night water and sky palettes.
- Five distant islands and one moving boat in Battery saver; eight islands and two boats in Detailed mode.
- Existing clouds, birds, pedestrians, cyclists, sky trams, camera journeys and driving remain active.
- New animations share the existing visibility-aware clock and respect pause, hidden tabs, open panels, and reduced motion. No new dependencies or remote assets.

Validation: all 32 tests pass, including a new camera-projection test across the full route at three desktop sizes. TypeScript and production build pass; the existing Three.js bundle advisory remains. Production browser checks verified day/night, manual driving entry and exit, chapter navigation, Battery saver, animation pause, normal-view round trip, and no console errors. Measured 390 px phone viewport had no document overflow. Fresh mobile entry had zero canvases before intentional island entry.

The scene adds approximately 1 KB gzip to the lazy 3D bundle. No physical-phone FPS benchmark was performed; the earlier Lighthouse scores describe the previous implementation.

Screenshots: [desktop](coastal-world-desktop.jpg), [night](coastal-world-night.jpg), [phone](coastal-world-mobile.jpg).
