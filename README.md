<div align="center">

# Bondeth World — 3D Portfolio

**Explore the person, skills, journey, projects, experiments, and contact details behind [bondeth.dev](https://www.bondeth.dev/en) on a living island.**

[![Live Site](https://img.shields.io/badge/Live_site-3d.bondeth.dev-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)](https://3d.bondeth.dev/)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## Overview

Bondeth World presents Rithy Bondeth’s portfolio as a floating coastal island. Scrolling follows a blue BMW M4 around a 301-metre route through six chapters: About, Skills, Journey, Work, Explore, and Contact. Each chapter introduces part of the portfolio; full details and case studies open on [bondeth.dev](https://www.bondeth.dev/en).

The island holds colorful project districts, a companion, an AI portal, sky trams, a waterfall, and a waterfront with ferries, yachts, and sailboats. Manual driving is also available.

## Features

- **Six-chapter journey:** About, skills and services, career and education, 17 projects, labs/writing/videos, and contact. The destination rail opens a local overview for each topic.
- **Project discovery:** AI, Web, Mobile, and macOS districts and a searchable gallery. Every project link opens its matching case study on bondeth.dev.
- **Manual driving:** acceleration, braking, reversing, steering, and collisions. Use WASD or arrow keys on desktop, or steering and pedal controls on phones.
- **A living world:** pedestrians, cyclists, an electric shuttle, glowing windows at night, waves, and moving boats.
- **World settings:** day/night lighting, optional sounds, ambient animation pause, and Auto, Detailed, or Battery saver graphics.
- **Accessible fallback:** Simple view, reduced-motion support, keyboard controls, and a WebGL error fallback.
- **Mobile:** the live island loads automatically. Vertical swipes scroll the cinematic route. Compact labels and a single-row destination rail leave the island visible while retaining 44 px tap targets.
- **Project sharing:** legacy island project URLs forward to the matching primary-site case study with a fallback link. The island sitemap includes its homepage.

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| 3D | Three.js, React Three Fiber, Drei |
| Build | Vite |
| Icons and fonts | Phosphor Icons, Fontsource |
| Testing | Node test runner, Lighthouse audits, GitHub Actions |

## Getting Started

Node.js 22.18 or newer is required.

```bash
git clone https://github.com/RithyBondeth/3D-Simulation-Portfolio.git
cd 3D-Simulation-Portfolio
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). No API keys or environment variables are required.

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
| Scroll or destination buttons | Follow the car through the six chapters |
| **M** | Switch between portfolio and manual driving |
| **W / ↑**, **S / ↓**, **A / D**, **← / →** | Accelerate, brake or reverse, steer |
| **Space** | Brake |
| **E** | Open a nearby destination |
| **R** / **1–6** / **?** / **Esc** | Reset / open chapters / help / close panel |

## Project Structure

```text
3D-Simulation-Portfolio/
├── src/
│   ├── App.tsx            # Navigation, scroll stage, chapters, dialogs, driving mode
│   ├── components/        # World scenes, districts, fleet, driving HUD, portfolio UI
│   ├── lib/               # Portfolio story, routes, driving physics, graphics quality
│   ├── content.json       # Portfolio content
│   └── project-catalog.ts # Island project metadata
├── tests/                 # Unit tests for routes, driving, districts, gallery
├── artifacts/             # Verification notes and screenshots
├── public/models/         # 3D models and attributions
└── scripts/               # Social preview generator
```

The production build emits 17 static legacy project documents. Serve their directories before any SPA fallback. Their canonical URLs point to `https://www.bondeth.dev/en/projects/<id>`; older query-based links redirect in the app. The social preview is generated with `npm run assets:social`.

See [full-portfolio verification](artifacts/full-portfolio-verification.md), [automatic mobile island verification](artifacts/mobile-auto-island-verification.md), and [compact mobile verification](artifacts/mobile-compact-verification.md). All 33 Node tests and the production build pass. The Three.js bundle retains Vite’s size advisory.

## Credits

3D asset attributions are listed in [`public/models/ATTRIBUTION.md`](public/models/ATTRIBUTION.md) and [`ASSETS.md`](ASSETS.md).

## Author

**Rithy Bondeth** — Full Stack Developer & AI Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)](https://bondeth.dev)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RithyBondeth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rithy-bondeth-484073282/)

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
