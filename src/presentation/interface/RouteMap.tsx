import { bridgePath, annexRoad } from "../../domain/world/infrastructure";
import { portfolioSections } from "../../domain/portfolio/portfolio-story";
import { journeyCarPose } from "../../domain/world/scroll-journey";
import type { ProjectDistrict } from "../../data/portfolio/project-catalog";
const infrastructureMapPaths = [bridgePath, annexRoad].map((path) =>
  path.map((point, i) => `${i ? "L" : "M"}${point.x},${point.z}`).join(" "),
);

export default function RouteMap({
  progress,
  chapter,
  activeDistrict,
}: {
  progress: number;
  chapter: number;
  activeDistrict: ProjectDistrict;
}) {
  const routeCar = journeyCarPose(progress);
  return (
    <aside
      className="route-map"
      aria-label={`Island route, ${Math.round(progress * 100)} percent complete`}
    >
      <div>
        <span className="route-status" /> Scenic route{" "}
        <span>{String(Math.round(progress * 100)).padStart(2, "0")}%</span>
      </div>
      <svg viewBox="-57 -49 198 98" aria-hidden="true">
        <ellipse cx="112" cy="-8" rx="26" ry="23" className="map-island" />
        {infrastructureMapPaths.map((path, i) => (
          <path key={i} d={path} className="map-road" />
        ))}
        <rect
          x="-35"
          y="-25"
          width="70"
          height="44"
          rx="6"
          className="map-island"
        />
        <rect
          x="-44.5"
          y="-38.5"
          width="89"
          height="69"
          rx="8.5"
          className="map-road"
        />
        <rect x="-28" y="-15" width="13" height="22" rx="2" />
        <rect x="-12" y="-23" width="25" height="8" rx="2" />
        <rect x="18" y="-15" width="12" height="22" rx="2" />
        <circle cx={routeCar.x} cy={routeCar.z} r="3" className="map-car" />
      </svg>
      <span>
        {chapter === 3
          ? `${activeDistrict.name} · ${activeDistrict.projects.length} projects`
          : `${portfolioSections[chapter].name} · ${portfolioSections[chapter].detail}`}
      </span>
    </aside>
  );
}
