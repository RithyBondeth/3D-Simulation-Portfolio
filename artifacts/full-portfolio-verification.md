# Full portfolio island verification

Date: 2026-10-13
Branch: `bondeth/full-portfolio-island`

## Result

The island has six chapters and six overview destinations: About, Skills/services, Journey (career/education), Work, Explore (labs/writing/videos), and Contact. Normal view starts with About and uses the same destinations. Work labels appear during the Work chapter or manual driving. Projects, labs, selected articles, and full section details link to the existing primary portfolio.

All 17 project destinations at `https://www.bondeth.dev/en/projects/<id>` returned HTTP 200 with matching project titles. Native gallery and highlight links use those URLs. Actual browser navigation to the Bondex Notch case study was checked. Production `/projects/bondex-notch/` and older `?project=apsara-agentic` links were checked in the browser and reached the matching primary-site pages. Static legacy documents use meta refresh and a fallback link, rather than HTTP redirects. They load no app scripts and carry the primary-site canonical and `noindex,follow`. The island sitemap now contains only its homepage.

## Checks

- `npm test`: 33 passed, 0 failed, including canonical gallery links, legacy documents, portfolio section coverage, camera framing, fleet paths, and driving collisions.
- `npm run build`: passed. The existing Three.js bundle size advisory remains (DrivingWorld approximately 1.13 MB minified / 308 KB gzip).
- `git diff --check`: passed.
- Browser: services overview, career/education, labs/writing/videos, Work gallery, normal About default, and switching between live and normal views checked.
- Phones: actual 390×844 and 320×780 layouts checked without horizontal overflow. Six destinations use two rows. The live island now loads automatically on mobile. Native vertical scrolling stays enabled over the canvas, with orbit controls reserved for manual driving. World controls clear the destination rail.
- Fresh live browser session had no captured console errors during entry or normal/live view changes. One earlier temporary tab showed the existing WebGL error fallback; fresh entry and repeated view changes were rechecked successfully.

## Previews

- `full-portfolio-desktop.jpg`: desktop island overview.
- `full-portfolio-mobile.jpg`: 390 px live island overview.
- `full-portfolio-mobile-320.jpg`: narrow live island overview.

## Scope

Primary-site content was reviewed for destination URLs and overview coverage. This is a curated introduction, not an automatic sync with bondeth.dev. Future primary-site changes may require updating summaries and links. Static-host deployments must serve generated legacy project directories before an SPA fallback. See `mobile-auto-island-verification.md` for the subsequent automatic-loading and touch-wrapper fix. No deployment or GitHub merge was performed for this branch.
