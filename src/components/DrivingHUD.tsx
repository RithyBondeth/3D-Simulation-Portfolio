import {
  MapTrifoldIcon,
  ArrowUpRightIcon,
  NavigationArrowIcon,
} from "@phosphor-icons/react";
import { stations, type SectionId } from "../types";
import type { RoadTelemetry } from "../lib/driving";
export function DrivingHUD({
  telemetry: t,
  visited,
  onSelect,
  overview,
  onOverview,
}: {
  telemetry: RoadTelemetry;
  visited: SectionId[];
  onSelect: (id: SectionId) => void;
  overview: boolean;
  onOverview: () => void;
}) {
  const nearest = stations.reduce((a, b) =>
    Math.hypot(a.position[0] - t.x, a.position[2] - t.z) <
    Math.hypot(b.position[0] - t.x, b.position[2] - t.z)
      ? a
      : b,
  );
  const distance = Math.round(
    Math.hypot(nearest.position[0] - t.x, nearest.position[2] - t.z),
  );
  return (
    <>
      <aside className="drive-dashboard" aria-label="Vehicle dashboard">
        <div className="vehicle-name">
          <span className="m-stripes">
            <i />
            <i />
            <i />
          </span>{" "}
          BMW M4 <span>COMPETITION</span>
        </div>
        <div className="speedometer">
          <span className="speed-value">
            {Math.round(Math.abs(t.speed) * 3.6)
              .toString()
              .padStart(2, "0")}
          </span>
          <span className="speed-unit">
            km/h
            <span>
              {t.speed < -0.05 ? "R" : Math.abs(t.speed) < 0.05 ? "P" : "D"}
            </span>
          </span>
          <span className={`drive-status ${t.offroad ? "offroad" : ""}`}>
            <i />
            {t.offroad ? "OFF ROAD" : "FREE ROAM"}
          </span>
        </div>
        <div className="drive-meter">
          <span
            style={{
              transform: `scaleX(${Math.min(Math.abs(t.speed) / 18, 1)})`,
            }}
          />
        </div>
        <div className="vehicle-footer">
          <span>{(t.distance / 1000).toFixed(2)} km explored</span>
          <span>
            <kbd>SPACE</kbd> brake
          </span>
        </div>
      </aside>
      <aside className="island-minimap" aria-label="Live island map">
        <button className="minimap-title" onClick={onOverview}>
          <span>
            <MapTrifoldIcon size={16} />
            {overview ? "Back to driving" : "Island map"}
          </span>
          <ArrowUpRightIcon size={14} />
        </button>
        <div className="minimap-board">
          <svg viewBox="-65 -55 130 110" aria-hidden="true">
            <rect
              x="-62"
              y="-52"
              width="124"
              height="104"
              rx="20"
              fill="#d9e3cd"
            />
            <rect
              x="-40"
              y="-31"
              width="80"
              height="62"
              rx="10"
              fill="none"
              stroke="#a4b4b2"
              strokeWidth="10"
            />
            <path d="M-40 0H40" stroke="#a4b4b2" strokeWidth="8" />
            <circle r="7" fill="#a4b4b2" />
            <circle r="4" fill="#d9e3cd" />
            <g
              transform={`translate(${t.x} ${t.z}) rotate(${(-t.yaw * 180) / Math.PI})`}
            >
              <circle r="4.8" fill="#fff" opacity=".7" />
              <path d="M0 -3.5 2.5 3 0 1.7 -2.5 3Z" fill="#185b7b" />
            </g>
          </svg>
          {stations.map((s) => (
            <button
              key={s.id}
              className={`minimap-stop ${visited.includes(s.id) ? "visited" : ""}`}
              style={{
                left: `${((s.position[0] + 65) / 130) * 100}%`,
                top: `${((s.position[2] + 55) / 110) * 100}%`,
              }}
              onClick={() => onSelect(s.id)}
              aria-label={`Open ${s.number} ${s.title}`}
            >
              {s.number}
            </button>
          ))}
          <span className="map-north">N ↑</span>
        </div>
        <button className="next-stop" onClick={() => onSelect(nearest.id)}>
          <span className="next-stop-icon">
            <NavigationArrowIcon size={17} />
          </span>
          <span>
            <small>NEAREST DESTINATION · {distance} M</small>
            <strong>{nearest.title}</strong>
          </span>
          <ArrowUpRightIcon size={15} />
        </button>
      </aside>
    </>
  );
}
