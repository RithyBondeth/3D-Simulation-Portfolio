<div align="center">

# Bondeth World — 3D Portfolio

**An interactive 3D portfolio set in a floating cartoon world, with four scroll-driven camera scenes: arrival, selected work, the AI portal, and contact.**

[![Live Site](https://img.shields.io/badge/Live_site-3d.bondeth.dev-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)](https://3d.bondeth.dev/)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## Overview

Bondeth World presents Rithy Bondeth's portfolio as a living island. As you scroll, a blue BMW M4 drives a 301-metre circuit around the island while the camera follows it through four connected chapters. You can also take the wheel and drive yourself.

The island holds sculpted towers, rooftop gardens, four interactive project districts, a flying companion, sky trams, a waterfall, a busy waterfront, and a sunlit ocean full of ferries, yachts, and sailboats.

## Features

- **Scroll-driven storytelling** through four camera chapters: arrival, selected work, AI portal, and contact.
- **Project districts:** 17 projects grouped into AI, Web, Mobile, and macOS districts, plus a searchable gallery and case studies.
- **Manual driving:** acceleration, braking, reversing, speed-dependent steering, and collisions. Works on desktop (WASD or arrow keys) and phones (touch steering and pedals).
- **A living world:** pedestrians, cyclists, an electric shuttle, glowing windows at night, and animated waves and boats.
- **World settings:** day and night lighting, optional sounds, ambient-animation pause, and Auto, Detailed, or Battery saver graphics.
- **Accessible fallbacks:** a Simple view with all content and no WebGL, reduced-motion support, and keyboard shortcuts.
- **Mobile-friendly loading:** a lightweight preview first, with the live scene loaded on demand.
- **SEO-ready:** 17 prerendered project pages with their own metadata, a sitemap, and a generated social preview.

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| 3D | Three.js, React Three Fiber, Drei |
| Build | Vite |
| Icons and fonts | Phosphor Icons, Fontsource |
| Testing | Node test runner, Lighthouse audits, GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 22.18 or newer

### Installation

```bash
git clone https://github.com/RithyBondeth/3D-Simulation-Portfolio.git
cd 3D-Simulation-Portfolio
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). No API keys or environment variables are required.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the test suite |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run assets:social` | Regenerate the social preview image |

## Controls

| Input | Action |
| --- | --- |
| Scroll or chapter buttons | Follow the car through the world |
| **M** | Switch between portfolio and manual driving |
| **W / ↑**, **S / ↓**, **A / D**, **← / →** | Accelerate, brake or reverse, steer |
| **Space** | Brake |
| **E** | Open a nearby destination |
| **R** / **1–5** / **?** / **Esc** | Reset / open destinations / help / close panel |

## Project Structure

```text
3D-Simulation-Portfolio/
├── src/
│   ├── App.tsx            # Navigation, scroll stage, chapters, dialogs, driving mode
│   ├── components/        # World scenes, districts, fleet, driving HUD, portfolio UI
│   ├── lib/               # Layout, routes, driving physics, graphics quality, districts
│   ├── content.json       # Portfolio content
│   └── project-catalog.ts # Project metadata
├── tests/                 # Unit tests for routes, driving, districts, gallery
├── artifacts/             # Verification notes and Lighthouse reports
├── public/models/         # 3D models and attributions
└── scripts/               # Social preview generator
```

## Credits

3D asset attributions are listed in [`public/models/ATTRIBUTION.md`](public/models/ATTRIBUTION.md) and [`ASSETS.md`](ASSETS.md).

## Author

**Rithy Bondeth** — Full Stack Developer & AI Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)](https://bondeth.dev)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RithyBondeth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rithy-bondeth-484073282/)

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
