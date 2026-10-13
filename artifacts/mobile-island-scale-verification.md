# Mobile island framing — 2026-10-13

Phone portrait camera distance is reduced through a shared `journeyFrame` helper. The full route retains continuous camera motion; decorative satellites may sit outside the closer phone composition.

At widths up to 760 px, project annotations use a 148 × 54 px title card with a 44 px tap target. Metadata, descriptions, and pagination are removed from the floating phone annotation; the full gallery and district navigation remain available. The contact annotation becomes a compact Say hello button.

Validation: all 34 tests pass, including camera projection of the full M4 throughout the complete route at 320, 390, 440, and 760 px widths. Production build passes with the existing Three.js chunk advisory. Browser checks verified no document overflow at 320 and 440 px, actual 148 × 54 px annotation dimensions, a 44 px target, and opening the case study from the compact label. [Phone preview](mobile-island-scale.jpg).

Implementation prepared on `bondeth/header-footer-polish`; deployment status is tracked separately from these verification results.
