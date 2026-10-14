import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { InstancedBoxes, type BoxPiece } from "./rendering/InstancedBoxes";
import {
  railPose,
  railStations,
  railPeriod,
  railHeight,
  trainSchedule,
} from "../../domain/world/sky-rail";
import { useSceneMotion } from "./SceneMotion";
import type { SectionId } from "../../domain/portfolio/types";

export default function RailStation({
  station,
  night,
  showLabel,
  onSelect,
  trains,
}: {
  station: (typeof railStations)[number];
  night: boolean;
  showLabel: boolean;
  onSelect: (id: SectionId) => void;
  trains: number;
}) {
  const status = useRef<HTMLSpanElement>(null);
  const pose = railPose(station.distance);
  const pieces = useMemo<BoxPiece[]>(() => {
    const parts: BoxPiece[] = [
      { at: [3.4, 0, 7.2], size: [3.5, 0.35, 24], color: "#dddcc7" },
      { at: [1.77, 0.22, 7.2], size: [0.15, 0.05, 23.5], color: "#d9bd70" },
      { at: [3.3, 3.5, 7.2], size: [6.7, 0.3, 26], color: "#e7ead8" },
      { at: [3.4, 3.73, 7.2], size: [4.1, 0.18, 24], color: "#5c916c" },
      { at: [5.15, 1.1, 7.2], size: [0.08, 1.8, 23.5], color: "#698f85" },
      { at: [4.2, 0.7, 3.2], size: [0.7, 0.25, 3.4], color: "#b99570" },
      { at: [4.2, 0.7, 11.2], size: [0.7, 0.25, 3.4], color: "#b99570" },
    ];
    for (const z of [-4.2, 18.6])
      parts.push({
        at: [4.9, 1.9, z],
        size: [0.16, 3.5, 0.16],
        color: "#426b69",
      });
    for (const z of [-1, 4.5, 10, 15.5])
      parts.push({
        at: [3.6, 3.9, z],
        size: [2.8, 0.1, 3.8],
        color: "#284f67",
        rotation: [-0.1, 0, 0],
      });
    return parts;
  }, []);
  const shaft = useMemo<BoxPiece[]>(
    () => [
      {
        at: [station.shaft.x, railHeight / 2, station.shaft.z],
        size: [1.6, railHeight, 1.6],
        color: "#89aaa0",
      },
      {
        at: [station.shaft.x, 1.1, station.shaft.z + 0.82],
        size: [1.1, 2.2, 0.06],
        color: "#284f57",
      },
      {
        at: [station.shaft.x, railHeight + 0.7, station.shaft.z],
        size: [2.3, 1.4, 2.3],
        color: "#c8d9c5",
      },
    ],
    [station],
  );
  useSceneMotion((time) => {
    const stopped = Array.from({ length: trains }, (_, i) =>
      trainSchedule(time, (i * railPeriod) / trains),
    ).some((train) => train.station === station.id);
    const label = stopped
      ? "Train at platform · doors open"
      : "Island line · next train on its way";
    if (status.current && status.current.textContent !== label)
      status.current.textContent = label;
  });
  return (
    <>
      <InstancedBoxes pieces={shaft} night={night} />
      <group
        position={[pose.x, railHeight, pose.z]}
        rotation={[0, pose.yaw, 0]}
      >
        <InstancedBoxes pieces={pieces} night={night} />
        <Html
          position={[3.4, 5, 7.2]}
          center
          zIndexRange={[9, 1]}
          style={{ display: showLabel ? "block" : "none" }}
        >
          <button
            className="world-marker rail-stop-target"
            onClick={() => onSelect(station.section)}
            aria-label={`${station.name} station: explore ${station.section}`}
          >
            <span className="rail-line-label">● ISLAND LINE</span>
            {station.name} ↗
            <span ref={status}>Island line · next train on its way</span>
          </button>
        </Html>
      </group>
    </>
  );
}
