# Compact mobile island interface

Date: 2026-10-13
Branch: `bondeth/full-portfolio-island`

The 320 px and 390 px production preview now puts the island behind a shorter intro and a one-row destination rail. The header is 68 px tall; chapter headings and call-to-action labels are smaller, and repeated secondary facts are tucked away on phones. Shorter action labels avoid two-line buttons. The world veil fades sooner, so more color and detail remain visible. Floating labels are narrower, including a 120 px project card in the Work chapter. World settings and manual-drive controls sit beside the scene rather than across its center.

Browser checks at 320×780 and 390×844 found no horizontal overflow. The visible action buttons, labels, world controls, and six destination buttons retain tap heights of at least 44 px; the active Work project label measured 120×46 px. The island still loads automatically and vertical scrolling reaches Work. `npm test` passed all 33 tests, `npm run build` passed, and `git diff --check` passed. The existing large Three.js chunk advisory remains.

Previews: `mobile-compact-island.jpg` (About) and `mobile-compact-work.jpg` (Work).
